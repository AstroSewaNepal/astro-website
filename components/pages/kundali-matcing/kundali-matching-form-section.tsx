'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ServiceReport } from '@/components/images/services';
import DatePickerDropdown from '@/components/pages/free-kundali/date-picker-dropdown';
import { FreeKundaliGoogleSignIn } from '@/components/pages/free-kundali/free-kundali-google-sign-in';
import { ClockTimePicker } from '@/components/shared/clock-time-picker';
import {
  EMPTY_BIRTH_TIME,
  DEFAULT_UNKNOWN_BIRTH_TIME,
  UnknownBirthTimeCheckbox,
  birthTimePartsToInput,
  type BirthTimeParts,
} from '@/components/shared/birth-time-fields';
import {
  bundleToStoredResult,
  fetchKundaliMatchingBundle,
} from '@/lib/vedastro/fetch-kundali-matching-bundle';

// ─── Types ────────────────────────────────────────────────────────────────────

type GeocodeResponseItem = {
  lat: string;
  lon: string;
};

/** Per-field error keys for one person */
type PersonErrors = {
  fullName?: string;
  dateOfBirth?: string;
  birthPlace?: string;
  birthTime?: string;
  gender?: string;
};

type FormErrors = {
  man: PersonErrors;
  woman: PersonErrors;
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

  const parts = value.split(separator).map(p => p.trim());
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);
  if ([day, month, year].some(Number.isNaN)) return null;

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
    if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59 || hour < 1 || hour > 12)
      return null;
    if (suffix === 'pm' && hour !== 12) hour += 12;
    if (suffix === 'am' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  const regularMatch = value.match(/^(\d{1,2})[:.:](\d{2})$/);
  if (!regularMatch) return null;

  const hour = Number(regularMatch[1]);
  const minute = Number(regularMatch[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) return null;

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

async function geocodePlace(place: string): Promise<GeocodeResponseItem> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`,
  );
  if (!response.ok) throw new Error(`Failed to resolve coordinates for "${place}".`);
  const data = (await response.json()) as GeocodeResponseItem[];
  const first = data[0];
  if (!first)
    throw new Error(`Place not found: "${place}". Please enter a more specific location.`);
  return first;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

type IconProps = { className?: string };

const UserIcon = ({ className }: IconProps) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path d="M20 21a8 8 0 10-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M12 13a4 4 0 100-8 4 4 0 000 8z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarIcon = ({ className }: IconProps) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LocationIcon = ({ className }: IconProps) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M12 21s7-4.4 7-11a7 7 0 10-14 0c0 6.6 7 11 7 11z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 12.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = ({ className }: IconProps) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M6 8l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── FieldError helper ────────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <span className="block mt-1 px-1 font-mukta text-[11px] md:text-[12px] text-red-600 leading-tight">
      {message}
    </span>
  ) : null;

// ─── Pill Input ───────────────────────────────────────────────────────────────

type InputPillProps = {
  id: string;
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  rightIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onInput?: React.FormEventHandler<HTMLInputElement>;
  error?: string;
};

const InputPill = ({
  id,
  label,
  name,
  type = 'text',
  placeholder,
  rightIcon,
  className,
  disabled,
  value,
  onChange,
  onInput,
  error,
}: InputPillProps) => (
  <div className={['block', className].filter(Boolean).join(' ')}>
    <label htmlFor={id} className="block font-mukta text-[12px] md:text-[13px] text-primary mb-1.5">
      {label}
    </label>
    <span className="relative block">
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        title={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onInput={onInput}
        className={[
          'w-full min-w-0 h-10 md:h-11 rounded-full border-2 bg-[#fbf5ec]/70 px-4 pr-16 font-mukta text-[13px] md:text-[14px] text-[#141414] placeholder:text-[#7b6b69] outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap',
          error ? 'border-red-500 focus:border-red-500' : 'border-primary focus:border-primary',
        ].join(' ')}
      />
      {rightIcon ? (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary/70">
          {rightIcon}
        </span>
      ) : null}
    </span>
    <FieldError message={error} />
  </div>
);

// ─── Pill Select ──────────────────────────────────────────────────────────────

type SelectPillProps = {
  id: string;
  label: string;
  name: string;
  className?: string;
  error?: string;
};

const DatePickerPill = ({
  id,
  label,
  name,
  value,
  error,
  open,
  onOpenChange,
  onDateSelect,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  error?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect: (value: string) => void;
}) => (
  <div className="relative">
    <label htmlFor={id} className="block font-mukta text-sm text-Trinary mb-2">
      {label}
    </label>
    <button
      id={id}
      type="button"
      onClick={() => onOpenChange(true)}
      className={clsx(
        'relative w-full h-10 md:h-11 rounded-full border-2 bg-[#fbf5ec]/70 px-4 pr-10 font-mukta text-[13px] md:text-[14px] text-[#141414] outline-none focus:ring-2 focus:ring-primary/10 transition-colors flex items-center',
        error ? 'border-red-500' : 'border-primary',
      )}
    >
      <span className="flex-1 min-w-0 truncate text-left">{value || 'Select date of birth'}</span>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary">
        <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
      </span>
    </button>
    <input type="hidden" name={name} value={value} />
    <DatePickerDropdown
      open={open}
      onOpenChange={onOpenChange}
      onDateSelect={onDateSelect}
      value={value}
    />
    <FieldError message={error} />
  </div>
);

const SelectPill = ({ id, label, name, className, error }: SelectPillProps) => (
  <div className={['block', className].filter(Boolean).join(' ')}>
    <label htmlFor={id} className="block font-mukta text-[12px] md:text-[13px] text-primary mb-1.5">
      {label}
    </label>
    <span className="relative block">
      <select
        id={id}
        name={name}
        defaultValue=""
        className={[
          'w-full h-10 md:h-11 appearance-none rounded-full border-2 bg-[#fbf5ec]/70 px-4 pr-10 font-mukta text-[13px] md:text-[14px] text-[#141414] outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer transition-colors',
          error ? 'border-red-500 focus:border-red-500' : 'border-primary focus:border-primary',
        ].join(' ')}
      >
        <option value="" disabled>
          Select
        </option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary/70">
        <ChevronIcon />
      </span>
    </span>
    <FieldError message={error} />
  </div>
);

// ─── Section pill header ──────────────────────────────────────────────────────

const SectionPillHeader = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={[
      'w-full rounded-full bg-primary py-2 text-center shadow-[0_8px_24px_rgba(97,21,8,0.14)]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    style={style}
  >
    {children}
  </div>
);

// ─── Person Section ───────────────────────────────────────────────────────────

type PersonSectionProps = {
  prefix: 'man' | 'woman';
  label: string;
  symbol: string;
  birthTimeParts: BirthTimeParts;
  onBirthTimeChange: (value: BirthTimeParts) => void;
  unknownBirthTime: boolean;
  onToggleUnknownTime: (v: boolean) => void;
  errors: PersonErrors;
  dateOfBirthValue: string;
  isDatePickerOpen: boolean;
  onDateOfBirthChange: (value: string) => void;
  onDatePickerOpenChange: (open: boolean) => void;
  birthPlaceValue: string;
  onBirthPlaceChange: (value: string) => void;
};

const PersonSection = ({
  prefix,
  label,
  symbol,
  birthTimeParts,
  onBirthTimeChange,
  unknownBirthTime,
  onToggleUnknownTime,
  errors,
  dateOfBirthValue,
  isDatePickerOpen,
  onDateOfBirthChange,
  onDatePickerOpenChange,
  birthPlaceValue,
  onBirthPlaceChange,
}: PersonSectionProps) => (
  <div className="space-y-3 md:space-y-3.5">
    <SectionPillHeader
      className="max-w-[397.649px] h-[61.573px] rounded-[32.41px] px-[19.44px] pt-[12.96px] pb-[12.96px] border-b-[0.81px] border-b-primary/50"
      style={{ gap: '8px', opacity: 1 }}
    >
      <span className="inline-flex items-center justify-center gap-2 font-sahitya font-bold text-[19.44px] leading-[30.79px] tracking-normal text-secondary">
        {label}
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-[27px] h-[27px] text-[27px] leading-none text-secondary/95"
        >
          {symbol}
        </span>
      </span>
    </SectionPillHeader>

    {/* Full name */}
    <InputPill
      id={`${prefix}-full-name`}
      label="Enter full name"
      name={`${prefix}FullName`}
      placeholder="Full Name"
      onInput={e => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z\s]/g, '');
      }}
      rightIcon={<UserIcon />}
      error={errors.fullName}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {/* Date of birth */}
      <DatePickerPill
        id={`${prefix}-dob`}
        label="Date of birth"
        name={`${prefix}DateOfBirth`}
        value={dateOfBirthValue}
        open={isDatePickerOpen}
        onOpenChange={onDatePickerOpenChange}
        onDateSelect={onDateOfBirthChange}
        error={errors.dateOfBirth}
      />

      {/* Birth place */}
      <InputPill
        id={`${prefix}-birth-place`}
        label="Birth place"
        name={`${prefix}BirthPlace`}
        placeholder="Where were you born?"
        value={birthPlaceValue}
        onChange={e => {
          const nextValue = e.currentTarget.value.replace(/[^A-Za-z\s,.'-]/g, '');
          onBirthPlaceChange(nextValue);
        }}
        onInput={e => {
          e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z\s,.'-]/g, '');
        }}
        rightIcon={<LocationIcon />}
        error={errors.birthPlace}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <ClockTimePicker
        id={`${prefix}-birth-time`}
        label="Birth time"
        value={birthTimeParts}
        onChange={onBirthTimeChange}
        disabled={unknownBirthTime}
      />

      <SelectPill
        id={`${prefix}-gender`}
        label="Select gender"
        name={`${prefix}Gender`}
        error={errors.gender}
      />
    </div>

    <UnknownBirthTimeCheckbox
      variant="matching"
      checked={unknownBirthTime}
      onChange={onToggleUnknownTime}
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_ERRORS: FormErrors = { man: {}, woman: {} };

const KundaliMatchingFormSection: React.FC = () => {
  const router = useRouter();

  const [manUnknownTime, setManUnknownTime] = useState(false);
  const [womanUnknownTime, setWomanUnknownTime] = useState(false);
  const [manBirthTime, setManBirthTime] = useState<BirthTimeParts>(EMPTY_BIRTH_TIME);
  const [womanBirthTime, setWomanBirthTime] = useState<BirthTimeParts>(EMPTY_BIRTH_TIME);
  const [manDateOfBirth, setManDateOfBirth] = useState('');
  const [womanDateOfBirth, setWomanDateOfBirth] = useState('');
  const [isManDatePickerOpen, setIsManDatePickerOpen] = useState(false);
  const [isWomanDatePickerOpen, setIsWomanDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<'idle' | 'generating' | 'almost-complete'>('idle');
  const [formErrors, setFormErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [manBirthPlace, setManBirthPlace] = useState('');
  const [womanBirthPlace, setWomanBirthPlace] = useState('');

  const nameRegex = /^[A-Za-z ]+$/;
  const placeRegex = /^[A-Za-z\s,.'-]+$/;

  /** Validate one person's fields. Returns parsed data or null, populates errorsOut. */
  const validatePerson = (
    prefix: 'man' | 'woman',
    formData: FormData,
    birthTimeParts: BirthTimeParts,
    unknownTime: boolean,
    errorsOut: PersonErrors,
  ): {
    fullName: string;
    dateOfBirth: string;
    birthTime: string;
    birthPlace: string;
    gender: string;
  } | null => {
    const fullName = String(formData.get(`${prefix}FullName`) ?? '').trim();
    const dateOfBirthInput = String(formData.get(`${prefix}DateOfBirth`) ?? '').trim();
    const birthTimeInput = birthTimePartsToInput(birthTimeParts).trim();
    const birthPlace = String(formData.get(`${prefix}BirthPlace`) ?? '').trim();
    const gender = String(formData.get(`${prefix}Gender`) ?? '').trim();

    let valid = true;

    // Full name
    if (!fullName) {
      errorsOut.fullName = 'Full name is required.';
      valid = false;
    } else if (!nameRegex.test(fullName)) {
      errorsOut.fullName = 'Only letters and spaces are allowed.';
      valid = false;
    }

    // Date of birth
    let parsedDate: string | null = null;
    if (!dateOfBirthInput) {
      errorsOut.dateOfBirth = 'Date of birth is required.';
      valid = false;
    } else {
      parsedDate = parseBirthDate(dateOfBirthInput);
      if (!parsedDate) {
        errorsOut.dateOfBirth = 'Invalid date. Use DD-MM-YYYY or select from calendar.';
        valid = false;
      }
    }

    // Birth place
    if (!birthPlace) {
      errorsOut.birthPlace = 'Birth place is required.';
      valid = false;
    } else if (!placeRegex.test(birthPlace) || !/[A-Za-z]/.test(birthPlace)) {
      errorsOut.birthPlace =
        'Only letters, commas, spaces, hyphens, apostrophes, and periods are allowed.';
      valid = false;
    }

    // Birth time
    let parsedTime = '12:00';
    if (!unknownTime) {
      if (!birthTimeInput) {
        errorsOut.birthTime = 'Birth time is required, or check "Don\'t know my exact birth time".';
        valid = false;
      } else {
        const t = parseBirthTime(birthTimeInput);
        if (!t) {
          errorsOut.birthTime = 'Invalid time. Use HH:mm or hh:mm am/pm.';
          valid = false;
        } else {
          parsedTime = t;
        }
      }
    }

    // Gender
    if (!gender) {
      errorsOut.gender = 'Please select a gender.';
      valid = false;
    }

    if (!valid) return null;

    return {
      fullName,
      dateOfBirth: parsedDate!,
      birthTime: parsedTime,
      birthPlace,
      gender,
    };
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStage('generating');
    const almostCompleteTimer = window.setTimeout(() => {
      setSubmitStage('almost-complete');
    }, 1200);

    const newErrors: FormErrors = { man: {}, woman: {} };
    const formData = new FormData(e.currentTarget);

    const man = validatePerson('man', formData, manBirthTime, manUnknownTime, newErrors.man);
    const woman = validatePerson(
      'woman',
      formData,
      womanBirthTime,
      womanUnknownTime,
      newErrors.woman,
    );

    // If any field has errors, show them and stop
    if (!man || !woman) {
      setFormErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Clear errors on successful validation
    setFormErrors(EMPTY_ERRORS);

    try {
      const manGeo = await geocodePlace(man.birthPlace);
      const womanGeo = await geocodePlace(woman.birthPlace);

      const manPerson = {
        fullName: man.fullName,
        dateOfBirth: man.dateOfBirth,
        birthTime: man.birthTime,
        birthPlace: man.birthPlace,
        gender: man.gender,
        latitude: manGeo.lat,
        longitude: manGeo.lon,
      };
      const womanPerson = {
        fullName: woman.fullName,
        dateOfBirth: woman.dateOfBirth,
        birthTime: woman.birthTime,
        birthPlace: woman.birthPlace,
        gender: woman.gender,
        latitude: womanGeo.lat,
        longitude: womanGeo.lon,
      };

      const bundle = await fetchKundaliMatchingBundle({
        manLat: manGeo.lat,
        manLon: manGeo.lon,
        manDate: man.dateOfBirth,
        manTime: man.birthTime,
        manOffset: getLocalOffset(man.dateOfBirth),
        manLocation: man.birthPlace,
        manName: man.fullName,
        manGender: man.gender,
        womanLat: womanGeo.lat,
        womanLon: womanGeo.lon,
        womanDate: woman.dateOfBirth,
        womanTime: woman.birthTime,
        womanOffset: getLocalOffset(woman.dateOfBirth),
        womanLocation: woman.birthPlace,
        womanName: woman.fullName,
        womanGender: woman.gender,
      });

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'kundaliMatchingResult',
          JSON.stringify(bundleToStoredResult(manPerson, womanPerson, bundle)),
        );
      }

      router.push('/kundali-matching/result');
    } catch (submitError) {
      setFormErrors(prev => ({
        ...prev,
        general:
          submitError instanceof Error
            ? submitError.message
            : 'Failed to process kundali matching.',
      }));
    } finally {
      window.clearTimeout(almostCompleteTimer);
      setSubmitStage('idle');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto mt-6 md:mt-8">
      <h2 className="w-[287px] md:w-full md:text-center font-sahitya font-bold text-[20px] leading-[38px] md:text-[28px] md:leading-[38px] text-primary mb-4 md:mb-6 opacity-100">
        Fill Up The Form To Match Kundali
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch">
        {/* Form card */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="w-full max-w-[760px] mx-auto lg:mx-0 lg:max-w-none lg:col-span-8 rounded-[32.41px] md:rounded-[32px] border-2 border-primary shadow-[0_10px_30px_rgba(97,21,8,0.08)] p-4 pb-[12.96px] md:p-6"
        >
          <div>
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* Man */}
              <PersonSection
                prefix="man"
                label="Man"
                symbol="♂"
                birthTimeParts={manBirthTime}
                onBirthTimeChange={setManBirthTime}
                unknownBirthTime={manUnknownTime}
                onToggleUnknownTime={v => {
                  setManUnknownTime(v);
                  if (v) {
                    setManBirthTime(DEFAULT_UNKNOWN_BIRTH_TIME);
                    setFormErrors(prev => ({
                      ...prev,
                      man: { ...prev.man, birthTime: undefined },
                    }));
                  }
                }}
                errors={formErrors.man}
                dateOfBirthValue={manDateOfBirth}
                isDatePickerOpen={isManDatePickerOpen}
                onDateOfBirthChange={setManDateOfBirth}
                onDatePickerOpenChange={setIsManDatePickerOpen}
                birthPlaceValue={manBirthPlace}
                onBirthPlaceChange={value => {
                  setManBirthPlace(value);
                  setFormErrors(prev => ({
                    ...prev,
                    man: { ...prev.man, birthPlace: undefined },
                  }));
                }}
              />

              <div
                aria-hidden
                className="md:hidden h-0 opacity-100 w-[calc(100%+32px)] -mx-4 mt-2"
                style={{
                  borderTop: '1.62px dashed var(--primary)',
                  borderImage:
                    'repeating-linear-gradient(to right, var(--primary) 0 4.861026287078857px, transparent 4.861026287078857px 9.722052574157714px) 1',
                }}
              />

              {/* Woman */}
              <PersonSection
                prefix="woman"
                label="Woman"
                symbol="♀"
                birthTimeParts={womanBirthTime}
                onBirthTimeChange={setWomanBirthTime}
                unknownBirthTime={womanUnknownTime}
                onToggleUnknownTime={v => {
                  setWomanUnknownTime(v);
                  if (v) {
                    setWomanBirthTime(DEFAULT_UNKNOWN_BIRTH_TIME);
                    setFormErrors(prev => ({
                      ...prev,
                      woman: { ...prev.woman, birthTime: undefined },
                    }));
                  }
                }}
                errors={formErrors.woman}
                dateOfBirthValue={womanDateOfBirth}
                isDatePickerOpen={isWomanDatePickerOpen}
                onDateOfBirthChange={setWomanDateOfBirth}
                onDatePickerOpenChange={setIsWomanDatePickerOpen}
                birthPlaceValue={womanBirthPlace}
                onBirthPlaceChange={value => {
                  setWomanBirthPlace(value);
                  setFormErrors(prev => ({
                    ...prev,
                    woman: { ...prev.woman, birthPlace: undefined },
                  }));
                }}
              />
            </div>

            <div className="mt-5 md:mt-6 flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-[154.814px] h-[48.61px] items-center justify-center rounded-[25.93px] bg-primary pt-[12.96px] pr-[32.41px] pb-[12.96px] pl-[32.41px] font-mukta text-[14.58px] font-semibold leading-[24.31px] tracking-normal text-secondary shadow-[0_10px_26px_rgba(97,21,8,0.18)] transition-colors hover:bg-[#8e2f27] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ gap: '8.1px', opacity: isSubmitting ? 0.6 : 1 }}
              >
                {isSubmitting
                  ? submitStage === 'generating'
                    ? 'Generating…'
                    : 'Almost complete...'
                  : 'Generate Now'}
              </button>

              {formErrors.general ? (
                <p className="font-mukta text-sm text-red-600 text-center max-w-xs">
                  {formErrors.general}
                </p>
              ) : null}
            </div>
          </div>
        </form>

        {/* Aside card */}
        <aside className="w-full max-w-[520px] h-[392px] mx-auto lg:mx-0 lg:max-w-none lg:h-auto lg:col-span-4 rounded-[40px] md:rounded-[32px] border border-primary bg-primary text-secondary shadow-[0_12px_34px_rgba(97,21,8,0.22)] p-4 md:p-7 flex flex-col items-center justify-center gap-4 md:gap-6">
          <div
            className="relative p-2"
            style={{ width: '188.2345px', height: '220.7189px', opacity: 1 }}
          >
            <Image
              src={ServiceReport}
              alt="Astrologer illustration"
              fill
              className="object-contain filter brightness-0 invert"
              sizes="240px"
            />
          </div>

          <h3 className="font-sahitya font-bold text-[28px] leading-[38px] text-center">
            Get Lifetime Access to Your Kundali Matchmaking
          </h3>

          <FreeKundaliGoogleSignIn buttonClassName="inline-flex items-center justify-center gap-2 w-full h-[60px] rounded-full border border-[#e9d6cb] bg-[#f8f1e7] px-6 py-3 font-raleway text-[20px] font-semibold leading-[26px] tracking-[0] text-primary transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" />
        </aside>
      </div>
    </section>
  );
};

export default KundaliMatchingFormSection;
