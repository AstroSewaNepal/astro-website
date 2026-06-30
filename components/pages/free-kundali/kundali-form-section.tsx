'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  EMPTY_BIRTH_TIME,
  DEFAULT_UNKNOWN_BIRTH_TIME,
  UnknownBirthTimeCheckbox,
  birthTimePartsToInput,
  type BirthTimeParts,
} from '@/components/shared/birth-time-fields';
import { ClockTimePicker } from '@/components/shared/clock-time-picker';
import { CityAutocompleteInput } from '@/components/shared/city-autocomplete-input';
import { geocodePlace } from '@/lib/calculators/geocode-place';
import { cityToGeocodeResult, type CitySearchResult } from '@/lib/city-search-api';

import CalendarIcon from '@/components/icons/calendar-icon';
import UserLineIcon from '@/components/icons/user/user-line';
import ChevronDownIcon from '@/components/icons/chevron-down';
import { ServiceReport } from '@/components/images/services';
import { fetchFreeKundaliBundle } from '@/lib/vedastro/fetch-free-kundali-bundle';
import { FreeKundaliGoogleSignIn } from '@/components/pages/free-kundali/free-kundali-google-sign-in';
import DatePickerDropdown from '@/components/pages/free-kundali/date-picker-dropdown';

const fieldIconClass = 'w-5 h-5 md:w-6 md:h-6 shrink-0 text-primary';
const cardShell = clsx(
  'w-full box-border rounded-[32px] border px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8',
  'lg:px-[52px] lg:py-9',
);

type FieldErrors = {
  fullName?: string;
  dateOfBirth?: string;
  birthPlace?: string;
  birthTime?: string;
  gender?: string;
  general?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseBirthDate(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, yearText, monthText, dayText] = isoMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    if (year < 1000 || year > 9999) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  }

  const separator = value.includes('/') ? '/' : value.includes('-') ? '-' : '';
  if (!separator) return null;

  const parts = value.split(separator).map(part => part.trim());
  if (parts.length !== 3) return null;

  const [first, second, third] = parts.map(Number);
  if ([first, second, third].some(Number.isNaN)) return null;

  const day = first;
  const month = second;
  const year = third;

  if (year < 1000 || year > 9999) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

function parseBirthTime(input: string): string | null {
  const value = input.trim().toLowerCase();
  if (!value) return null;

  const ampmMatch = value.match(/^(\d{1,2})[:.:](\d{2})\s*(am|pm)$/);
  if (ampmMatch) {
    let hour = Number(ampmMatch[1]);
    const minute = Number(ampmMatch[2]);
    const suffix = ampmMatch[3];
    if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59 || hour < 1 || hour > 12) {
      return null;
    }
    if (suffix === 'pm' && hour !== 12) hour += 12;
    if (suffix === 'am' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  const regularMatch = value.match(/^(\d{1,2})[:.:](\d{2})$/);
  if (!regularMatch) return null;

  const hour = Number(regularMatch[1]);
  const minute = Number(regularMatch[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) {
    return null;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getLocalOffset(dateInput: string): string {
  const [day, month, year] = dateInput.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// ─── FieldError helper ────────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <span className="block mt-1.5 px-1 font-mukta text-xs text-red-600 leading-tight">
      {message}
    </span>
  ) : null;

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_ERRORS: FieldErrors = {};

export type KundaliFormSectionProps = {
  /** Prefilled after Google sign-in (Next Auth session name). */
  defaultFullName?: string;
  /** Set when redirected back from a failed OAuth attempt. */
  oauthError?: boolean;
};

const KundaliFormSection: React.FC<KundaliFormSectionProps> = ({
  defaultFullName,
  oauthError = false,
}) => {
  const router = useRouter();
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [birthTimeParts, setBirthTimeParts] = useState<BirthTimeParts>(EMPTY_BIRTH_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<'idle' | 'generating' | 'almost-complete'>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_ERRORS);
  const [dateOfBirthValue, setDateOfBirthValue] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [birthPlaceValue, setBirthPlaceValue] = useState('');
  const [selectedBirthCity, setSelectedBirthCity] = useState<CitySearchResult | null>(null);

  const nameRegex = /^[A-Za-z ]+$/;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const dateOfBirthInput = dateOfBirthValue.trim();
    const birthPlace = String(formData.get('birthPlace') ?? '').trim();
    const birthTimeInput = birthTimePartsToInput(birthTimeParts).trim();
    const gender = String(formData.get('gender') ?? '').trim();

    // ── Per-field validation ──────────────────────────────────────────────────
    const errors: FieldErrors = {};
    let valid = true;

    if (!fullName) {
      errors.fullName = 'Full name is required.';
      valid = false;
    } else if (!nameRegex.test(fullName)) {
      errors.fullName = 'Only letters and spaces are allowed.';
      valid = false;
    }

    let parsedDate: string | null = null;
    if (!dateOfBirthInput) {
      errors.dateOfBirth = 'Date of birth is required.';
      valid = false;
    } else {
      parsedDate = parseBirthDate(dateOfBirthInput);
      if (!parsedDate) {
        errors.dateOfBirth = 'Invalid date. Use DD-MM-YYYY or select from calendar.';
        valid = false;
      }
    }

    if (!birthPlace) {
      errors.birthPlace = 'Birth place is required.';
      valid = false;
    }

    let parsedTime: string | null = null;
    if (unknownBirthTime) {
      parsedTime = '12:00';
    } else if (!birthTimeInput) {
      errors.birthTime = 'Birth time is required, or check "Don\'t know my exact birth time".';
      valid = false;
    } else {
      parsedTime = parseBirthTime(birthTimeInput);
      if (!parsedTime) {
        errors.birthTime = 'Invalid time. Use HH:mm or hh:mm am/pm.';
        valid = false;
      }
    }

    if (!gender) {
      errors.gender = 'Please select a gender.';
      valid = false;
    }

    if (!valid) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // Clear field errors on valid submission
    setFieldErrors(EMPTY_ERRORS);
    setIsSubmitting(true);
    setSubmitStage('generating');
    const almostCompleteTimer = window.setTimeout(() => {
      setSubmitStage('almost-complete');
    }, 1200);

    // ── Network calls ─────────────────────────────────────────────────────────
    try {
      let lat: string;
      let lon: string;
      let offset: string;
      let location = birthPlace;

      if (selectedBirthCity) {
        const geo = cityToGeocodeResult(selectedBirthCity);
        lat = geo.lat;
        lon = geo.lon;
        offset = geo.timezoneOffset;
        location = geo.displayName;
      } else {
        const selectedGeo = await geocodePlace(birthPlace);
        lat = selectedGeo.lat;
        lon = selectedGeo.lon;
        offset = getLocalOffset(parsedDate!);
      }

      const query = new URLSearchParams({
        lat,
        lon,
        date: parsedDate!,
        time: parsedTime!,
        offset,
        location,
        lang: 'ne',
      });

      const bundle = await fetchFreeKundaliBundle(query);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'freeKundaliResult',
          JSON.stringify({
            fullName,
            birthPlace,
            dateOfBirth: parsedDate,
            birthTime: parsedTime,
            gender,
            latitude: lat,
            longitude: lon,
            payload: { calculator: 'AllTimeData', payload: bundle.panchanga },
            planetRows: bundle.planetRows,
            doshas: bundle.doshas,
          }),
        );
      }
      router.push('/free-kundali/result');
    } catch (submitError) {
      if (
        submitError instanceof Error &&
        /Failed to resolve coordinates|Place not found/.test(submitError.message)
      ) {
        setFieldErrors({ birthPlace: submitError.message });
      } else {
        setFieldErrors({
          general:
            submitError instanceof Error ? submitError.message : 'Failed to generate kundali.',
        });
      }
    } finally {
      window.clearTimeout(almostCompleteTimer);
      setSubmitStage('idle');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="w-full px-4 md:px-8">
        <div className="mx-auto w-full max-w-[2400px]">
          <div className="flex flex-col lg:block items-center">
            {/* Right Card - Mobile Only */}
            <div
              className={clsx(
                'w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] h-[392px] box-border rounded-[40px] border border-primary bg-primary text-[#f7e9dd] p-4',
                'flex flex-col items-center justify-center text-center gap-4 shadow-[0_12px_34px_rgba(74,20,15,0.14)]',
                'lg:hidden mt-6',
              )}
            >
              <div className="relative w-full max-w-[220px] aspect-square rounded-[28px] p-5">
                <Image
                  src={ServiceReport}
                  alt="Astrologer illustration"
                  fill
                  className="object-contain filter brightness-0 invert"
                  sizes="220px"
                />
              </div>
              <p className="font-sahitya text-[22px] md:text-[24px] leading-snug font-bold">
                Get Lifetime Access to Your Kundali
              </p>
              <FreeKundaliGoogleSignIn buttonClassName="inline-flex items-center justify-center gap-2 w-full h-[60px] rounded-full border border-[#e9d6cb] bg-secondary px-6 py-3 font-raleway text-[20px] font-semibold leading-[26px] tracking-[0] text-primary transition-colors hover:bg-white -translate-y-2 disabled:cursor-not-allowed disabled:opacity-60" />
            </div>

            {/* Mobile Title */}
            <h2 className="md:hidden text-left w-full self-start font-sahitya text-primary text-[22px] sm:text-[28px] leading-[32px] font-bold mt-10 mb-4">
              Fill up the Details Report
            </h2>

            {/* Tablet + Desktop Title */}
            <h2 className="hidden md:block font-sahitya text-left text-primary text-[28px] leading-[38px] tracking-[0] font-bold mt-6 mb-8 lg:mb-8">
              Fill Up The Form To Generate Birth Kundali
            </h2>

            <div className="flex flex-col lg:grid lg:grid-cols-2 lg:w-full gap-6 lg:gap-6">
              {/* FORM */}
              <form
                onSubmit={onSubmit}
                noValidate
                className={clsx(
                  'w-[398px] max-w-full h-auto box-border rounded-[40px] border border-Trinary p-2 gap-4 shadow-[0_12px_34px_rgba(74,20,15,0.12)] md:w-full md:max-w-none md:h-auto lg:px-12 lg:pt-10 lg:pb-5',
                  'flex flex-col lg:w-full',
                )}
              >
                {oauthError ? (
                  <p
                    className="-mt-2 mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center font-mukta text-sm text-red-700"
                    role="alert"
                  >
                    Google sign-in did not finish. Please try again.
                  </p>
                ) : null}
                <div className="text-center border-b border-Trinary pb-1 md:pb-2 lg:pb-2 mb-5 md:mb-4 lg:mb-6 gap-10">
                  <h3 className="font-sahitya text-primary text-[22px] leading-[32px] md:text-[28px] md:leading-[38px] font-bold tracking-[0]">
                    Generate Your Kundali
                  </h3>
                </div>

                <fieldset className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-5 border-none p-0">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="kundali-full-name"
                      className="block font-mukta text-sm text-Trinary mb-2"
                    >
                      Enter full name
                    </label>
                    <div
                      className={clsx(
                        'flex items-center gap-3 rounded-full border px-4 py-3 focus-within:border-primary transition-colors',
                        fieldErrors.fullName ? 'border-red-500' : 'border-Trinary',
                      )}
                    >
                      <input
                        id="kundali-full-name"
                        name="fullName"
                        type="text"
                        defaultValue={defaultFullName}
                        placeholder="Enter name"
                        onInput={event => {
                          event.currentTarget.value = event.currentTarget.value.replace(
                            /[^A-Za-z\s]/g,
                            '',
                          );
                        }}
                        className="flex-1 min-w-0 bg-transparent font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph outline-none"
                      />
                      <UserLineIcon className={fieldIconClass} />
                    </div>
                    <FieldError message={fieldErrors.fullName} />
                  </div>

                  {/* DOB */}
                  <div className="relative">
                    <label
                      htmlFor="kundali-dob"
                      className="block font-mukta text-sm text-Trinary mb-2"
                    >
                      Enter date of birth
                    </label>
                    <button
                      onClick={() => setIsDatePickerOpen(true)}
                      type="button"
                      className={clsx(
                        'w-full flex items-center rounded-full border px-4 py-3 focus-within:border-primary transition-colors bg-transparent font-mukta text-sm md:text-base text-[#4f2620] cursor-pointer',
                        fieldErrors.dateOfBirth ? 'border-red-500' : 'border-Trinary',
                      )}
                    >
                      <span className="flex-1 min-w-0 text-left">
                        {dateOfBirthValue || 'Select date of birth'}
                      </span>
                      <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-primary" />
                    </button>
                    <DatePickerDropdown
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                      onDateSelect={setDateOfBirthValue}
                      value={dateOfBirthValue}
                    />
                    <FieldError message={fieldErrors.dateOfBirth} />
                  </div>

                  {/* Birth Place */}
                  <div>
                    <CityAutocompleteInput
                      id="kundali-birth-place"
                      name="birthPlace"
                      label="Enter birth place"
                      placeholder="Where were you born?"
                      value={birthPlaceValue}
                      onChange={nextValue => {
                        setBirthPlaceValue(nextValue);
                        setSelectedBirthCity(null);
                        setFieldErrors(prev => ({ ...prev, birthPlace: undefined }));
                      }}
                      onCitySelect={city => {
                        setSelectedBirthCity(city);
                        setFieldErrors(prev => ({ ...prev, birthPlace: undefined }));
                      }}
                      error={fieldErrors.birthPlace}
                    />
                  </div>

                  <div>
                    <ClockTimePicker
                      id="kundali-birth-time"
                      label="Enter birth time"
                      value={birthTimeParts}
                      onChange={setBirthTimeParts}
                      disabled={unknownBirthTime}
                      error={unknownBirthTime ? undefined : fieldErrors.birthTime}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label
                      htmlFor="kundali-gender"
                      className="block font-mukta text-sm text-Trinary mb-2"
                    >
                      Select gender
                    </label>
                    <div
                      className={clsx(
                        'relative flex items-center gap-3 rounded-full border px-4 py-3 focus-within:border-primary transition-colors',
                        fieldErrors.gender ? 'border-red-500' : 'border-Trinary',
                      )}
                    >
                      <select
                        id="kundali-gender"
                        name="gender"
                        defaultValue=""
                        className="flex-1 min-w-0 appearance-none bg-transparent font-mukta text-sm md:text-base text-Paragraph outline-none cursor-pointer pr-10"
                      >
                        <option value="" disabled className="text-Paragraph">
                          Select
                        </option>
                        <option value="male" className="text-Paragraph">
                          Male
                        </option>
                        <option value="female" className="text-Paragraph">
                          Female
                        </option>
                        <option value="other" className="text-Paragraph">
                          Other
                        </option>
                      </select>
                      <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c221d] pointer-events-none" />
                    </div>
                    <FieldError message={fieldErrors.gender} />
                  </div>
                </fieldset>

                <UnknownBirthTimeCheckbox
                  variant="kundali"
                  checked={unknownBirthTime}
                  onChange={checked => {
                    setUnknownBirthTime(checked);
                    if (checked) {
                      setBirthTimeParts(DEFAULT_UNKNOWN_BIRTH_TIME);
                      setFieldErrors(prev => ({ ...prev, birthTime: undefined }));
                    }
                  }}
                />

                <p className="font-mukta text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] text-[#5D1409]">
                  <span className="font-bold">Note:</span> Without time of birth, we can still achieve up to{' '}
                  <span className="font-bold">80% accurate</span> prediction
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 md:mt-6 lg:-translate-y-3 w-full h-[60px] gap-8 rounded-full bg-[#6d1510] text-[18px] font-mukta font-semibold leading-[30px] text-secondary transition-colors hover:bg-[#8e2f27] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting
                    ? submitStage === 'generating'
                      ? 'Generating your kundali…'
                      : 'Almost complete...'
                    : 'Generate Now'}
                </button>

                {fieldErrors.general ? (
                  <p className="font-mukta text-sm text-red-600 mt-1 text-center">
                    {fieldErrors.general}
                  </p>
                ) : null}
              </form>

              {/* Right Card - Desktop Only */}
              <div
                className={clsx(
                  cardShell,
                  'border border-primary bg-primary text-[#f7e9dd]',
                  'flex flex-col items-center justify-between text-center gap-6 shadow-[0_12px_34px_rgba(74,20,15,0.14)]',
                  'w-full hidden lg:flex',
                )}
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="relative w-full max-w-[277.916px] aspect-square rounded-[28px] p-5">
                    <Image
                      src={ServiceReport}
                      alt="Astrologer illustration"
                      fill
                      className="object-contain filter brightness-0 invert"
                    />
                  </div>
                  <p className="font-sahitya text-[28px] md:text-[26px] leading-snug font-bold">
                    Get Lifetime Access to Your Kundali
                  </p>
                </div>
                <FreeKundaliGoogleSignIn buttonClassName="inline-flex items-center justify-center gap-2 w-full h-[60px] rounded-full border border-[#e9d6cb] bg-[#f8f1e7] px-6 py-3 font-raleway text-[20px] font-semibold leading-[26px] tracking-[0] text-primary transition-colors hover:bg-white lg:rotate-0 lg:opacity-100 disabled:cursor-not-allowed disabled:opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default KundaliFormSection;
