'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { IoLocationOutline } from 'react-icons/io5';
import { LuClock } from 'react-icons/lu';

import CalendarIcon from '@/components/icons/calendar-icon';
import UserLineIcon from '@/components/icons/user/user-line';
import ChevronDownIcon from '@/components/icons/chevron-down';
import { ServiceReport } from '@/components/images/services';
import GoogleGIcon from '@/components/images/icons/google_G.png';

const fieldIconClass = 'w-5 h-5 md:w-6 md:h-6 shrink-0 text-primary';
const cardShell = clsx(
  'w-full box-border rounded-[32px] border px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8',
  'lg:px-[52px] lg:py-9',
);

// ─── Types ────────────────────────────────────────────────────────────────────

type GeocodeResponseItem = {
  lat: string;
  lon: string;
};

type VedastroResult = {
  success?: boolean;
  data?: unknown;
  message?: string;
  errors?: Array<{
    statusCode?: number;
    message?: string;
  }>;
};

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

  let day = first;
  let month = second;
  const year = third;

  // Supports both DD/MM/YYYY and MM/DD/YYYY input.
  if (first <= 12 && second <= 12 && third > 999) {
    month = first;
    day = second;
  }

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

function getCandidateBackendBases(): string[] {
  const candidates: string[] = [];
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (configured) {
    candidates.push(configured.endsWith('/') ? configured : `${configured}/`);
  } else {
    candidates.push('http://localhost:5000/');
  }

  candidates.push('http://localhost:5000/');

  return Array.from(new Set(candidates));
}

async function fetchVedastroGeneral(
  query: URLSearchParams,
): Promise<{ payload: VedastroResult; usedBase: string }> {
  const attemptErrors: string[] = [];

  for (const base of getCandidateBackendBases()) {
    const url = `${base}api/v1/vedastro/proxy/general?${query.toString()}`;
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const preview = text.slice(0, 120).replace(/\s+/g, ' ').trim();
        attemptErrors.push(
          `Non-JSON response from ${url} (status ${response.status}). Preview: ${preview || 'empty response'}`,
        );
        continue;
      }

      const payload = (await response.json()) as VedastroResult;
      if (!response.ok || payload.success === false) {
        const backendMessage = payload.message || payload.errors?.[0]?.message;
        attemptErrors.push(
          backendMessage || `Request failed on ${url} (status ${response.status}).`,
        );
        continue;
      }

      return { payload, usedBase: base };
    } catch (error) {
      attemptErrors.push(
        `Network error on ${url}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  throw new Error(attemptErrors[attemptErrors.length - 1] ?? 'Failed to reach backend endpoint.');
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

const KundaliFormSection: React.FC = () => {
  const router = useRouter();
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_ERRORS);

  const nameRegex = /^[A-Za-z ]+$/;
  const placeRegex = /^[A-Za-z ]+$/;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const dateOfBirthInput = String(formData.get('dateOfBirth') ?? '').trim();
    const birthPlace = String(formData.get('birthPlace') ?? '').trim();
    const birthTimeInput = String(formData.get('birthTime') ?? '').trim();
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
        errors.dateOfBirth = 'Invalid date. Use MM/DD/YYYY or select from calendar.';
        valid = false;
      }
    }

    if (!birthPlace) {
      errors.birthPlace = 'Birth place is required.';
      valid = false;
    } else if (!placeRegex.test(birthPlace) || !/[A-Za-z]/.test(birthPlace)) {
      errors.birthPlace = 'Only letters and spaces are allowed.';
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

    // ── Network calls ─────────────────────────────────────────────────────────
    try {
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(birthPlace)}&limit=1`,
      );
      if (!geocodeResponse.ok) {
        setFieldErrors({ birthPlace: 'Failed to resolve birth place coordinates.' });
        return;
      }
      const geocodeData = (await geocodeResponse.json()) as GeocodeResponseItem[];
      const firstMatch = geocodeData[0];
      if (!firstMatch) {
        setFieldErrors({
          birthPlace: 'Birth place not found. Please enter a more specific location.',
        });
        return;
      }

      const offset = getLocalOffset(parsedDate!);
      const query = new URLSearchParams({
        lat: firstMatch.lat,
        lon: firstMatch.lon,
        date: parsedDate!,
        time: parsedTime!,
        offset,
        location: birthPlace,
      });

      const { payload } = await fetchVedastroGeneral(query);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'freeKundaliResult',
          JSON.stringify({
            fullName,
            birthPlace,
            dateOfBirth: parsedDate,
            birthTime: parsedTime,
            gender,
            latitude: firstMatch.lat,
            longitude: firstMatch.lon,
            payload,
          }),
        );
      }
      router.push('/free-kundali/result');
    } catch (submitError) {
      setFieldErrors({
        general: submitError instanceof Error ? submitError.message : 'Failed to generate kundali.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full px-4 md:px-8">
      <div className="mx-auto w-full max-w-[2400px]">
        <div className="flex flex-col lg:block items-center">
          {/* Right Card - Mobile Only */}
          <div
            className={clsx(
              'w-full max-w-[398px] h-[392px] box-border rounded-[40px] border border-primary bg-primary text-[#f7e9dd] p-4',
              'flex flex-col items-center justify-center text-center gap-4 shadow-[0_12px_34px_rgba(74,20,15,0.14)]',
              'lg:hidden relative -top-2',
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
              View your saved Kundali
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 w-full h-[60px] rounded-full border border-[#e9d6cb] bg-secondary px-6 py-3 font-raleway text-[20px] font-semibold leading-[26px] tracking-[0] text-primary transition-colors hover:bg-white -translate-y-2"
            >
              <span
                aria-hidden
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
              >
                <Image src={GoogleGIcon} alt="" width={24} height={24} />
              </span>
              Continue with Google
            </button>
          </div>

          {/* Mobile Title */}
          <h2 className="md:hidden text-left w-full self-start font-sahitya text-primary text-[22px] sm:text-[28px] leading-[32px] font-bold mt-6 mb-4">
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
                      placeholder="John Doe"
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
                <div>
                  <label
                    htmlFor="kundali-dob"
                    className="block font-mukta text-sm text-Trinary mb-2"
                  >
                    Enter date of birth
                  </label>
                  <div
                    className={clsx(
                      'flex items-center rounded-full border px-4 py-3 focus-within:border-primary transition-colors',
                      fieldErrors.dateOfBirth ? 'border-red-500' : 'border-Trinary',
                    )}
                  >
                    <input
                      id="kundali-dob"
                      name="dateOfBirth"
                      type="date"
                      placeholder="Select date of birth"
                      className="cursor-pointer flex-1 min-w-0 bg-transparent font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph outline-none"
                    />
                  </div>
                  <FieldError message={fieldErrors.dateOfBirth} />
                </div>

                {/* Birth Place */}
                <div>
                  <label
                    htmlFor="kundali-birth-place"
                    className="block font-mukta text-sm text-Trinary mb-2"
                  >
                    Enter birth place
                  </label>
                  <div
                    className={clsx(
                      'flex items-center gap-3 rounded-full border px-4 py-3 focus-within:border-primary transition-colors',
                      fieldErrors.birthPlace ? 'border-red-500' : 'border-Trinary',
                    )}
                  >
                    <input
                      id="kundali-birth-place"
                      name="birthPlace"
                      type="text"
                      placeholder="Kathmandu Nepal"
                      onInput={event => {
                        event.currentTarget.value = event.currentTarget.value.replace(
                          /[^A-Za-z ]/g,
                          '',
                        );
                      }}
                      className="flex-1 min-w-0 bg-transparent font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph outline-none"
                    />
                    <IoLocationOutline className={fieldIconClass} aria-hidden />
                  </div>
                  <FieldError message={fieldErrors.birthPlace} />
                </div>

                {/* Birth Time */}
                <div>
                  <label
                    htmlFor="kundali-birth-time"
                    className="block font-mukta text-sm text-Trinary mb-2"
                  >
                    Enter birth time
                  </label>
                  <div
                    className={clsx(
                      'flex items-center gap-3 rounded-full border px-4 py-3 focus-within:border-primary transition-colors',
                      unknownBirthTime && 'opacity-50 pointer-events-none',
                      !unknownBirthTime && fieldErrors.birthTime
                        ? 'border-red-500'
                        : 'border-Trinary',
                    )}
                  >
                    <input
                      id="kundali-birth-time"
                      name="birthTime"
                      type="text"
                      disabled={unknownBirthTime}
                      placeholder="hh / mm / am"
                      className="flex-1 min-w-0 bg-transparent font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph outline-none disabled:cursor-not-allowed"
                    />
                    <LuClock className={fieldIconClass} aria-hidden />
                  </div>
                  {!unknownBirthTime && <FieldError message={fieldErrors.birthTime} />}
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

              {/* Unknown birth time checkbox */}
              <label className="flex items-center gap-3 cursor-pointer font-mukta text-sm text-primary mt-2 lg:mt-8 lg:mb-4">
                <span
                  className={clsx(
                    'flex h-5 w-5 items-center justify-center rounded-full border border-primary',
                    unknownBirthTime ? 'bg-primary' : 'bg-transparent',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={unknownBirthTime}
                    onChange={e => {
                      setUnknownBirthTime(e.target.checked);
                      if (e.target.checked) {
                        setFieldErrors(prev => ({ ...prev, birthTime: undefined }));
                      }
                    }}
                    className="sr-only"
                  />
                  {unknownBirthTime && (
                    <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
                  )}
                </span>
                <span>Don&apos;t know my exact birth time</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 md:mt-6 lg:-translate-y-3 w-full h-[60px] gap-8 rounded-full bg-[#6d1510] text-[18px] font-mukta font-semibold leading-[30px] text-secondary transition-colors hover:bg-[#8e2f27] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Generating...' : 'Generate Now'}
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
                'flex flex-col items-center justify-center text-center gap-6 shadow-[0_12px_34px_rgba(74,20,15,0.14)]',
                'w-full hidden lg:flex',
              )}
            >
              <div className="relative w-full max-w-[277.916px] aspect-square rounded-[28px] p-5">
                <Image
                  src={ServiceReport}
                  alt="Astrologer illustration"
                  fill
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <p className="font-sahitya text-[28px] md:text-[26px] leading-snug font-bold">
                View your saved Kundali
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 w-full h-[60px] rounded-full border border-[#e9d6cb] bg-[#f8f1e7] px-6 py-3 font-raleway text-[20px] font-semibold leading-[26px] tracking-[0] text-primary transition-colors hover:bg-white lg:rotate-0 lg:opacity-100"
              >
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white"
                >
                  <Image src={GoogleGIcon} alt="" width={24} height={24} />
                </span>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KundaliFormSection;
