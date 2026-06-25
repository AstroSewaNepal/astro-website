'use client';

import clsx from 'clsx';

export type BirthTimeParts = {
  hh: string;
  mm: string;
  ampm: string;
};

export const EMPTY_BIRTH_TIME: BirthTimeParts = { hh: '', mm: '', ampm: 'am' };
/** Noon placeholder shown in disabled time fields when "don't know exact birth time" is checked. */
export const DEFAULT_UNKNOWN_BIRTH_TIME: BirthTimeParts = { hh: '12', mm: '00', ampm: 'pm' };

/** Build `hh:mm am/pm` string for existing parseBirthTime helpers. */
export function birthTimePartsToInput(parts: BirthTimeParts): string {
  if (!parts.hh && !parts.mm) return '';
  const h = parts.hh || '12';
  const m = parts.mm.padStart(2, '0') || '00';
  return `${h}:${m} ${parts.ampm}`;
}

export function birthTimePartsToHHMM(parts: BirthTimeParts): string | undefined {
  if (!parts.hh && !parts.mm) return undefined;

  const hour = Number(parts.hh || '12');
  const minute = Number(parts.mm || '0');
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 1 ||
    hour > 12 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined;
  }

  let hour24 = hour;
  if (parts.ampm === 'pm' && hour !== 12) hour24 += 12;
  if (parts.ampm === 'am' && hour === 12) hour24 = 0;

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

type BirthTimeFieldsVariant = 'calculator' | 'kundali' | 'matching';

type BirthTimeFieldsProps = {
  id?: string;
  label?: string;
  value: BirthTimeParts;
  onChange: (value: BirthTimeParts) => void;
  disabled?: boolean;
  error?: string;
  variant?: BirthTimeFieldsVariant;
};

const CLOCK_ICON = (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export function BirthTimeFields({
  id = 'birth-time',
  label = 'Enter birth time',
  value,
  onChange,
  disabled = false,
  error,
  variant = 'calculator',
}: BirthTimeFieldsProps) {
  const setPart = (key: keyof BirthTimeParts, part: string) => {
    onChange({ ...value, [key]: part });
  };

  const containerClass = clsx(
    'relative flex items-center overflow-hidden transition-colors',
    variant === 'calculator' &&
      'rounded-full border-2 sm:border border-[#BE7B71] bg-transparent focus-within:border-[#A13924] focus-within:ring-2 focus-within:ring-[#A13924]/10 px-4 h-[48px] sm:h-auto',
    variant === 'kundali' &&
      clsx(
        'gap-0.5 rounded-full border px-4 py-3 focus-within:border-primary',
        error ? 'border-red-500' : 'border-Trinary',
      ),
    variant === 'matching' &&
      clsx(
        'relative w-full h-10 md:h-11 rounded-full border-2 bg-[#fbf5ec]/70 px-4 focus-within:ring-2 focus-within:ring-primary/10',
        error ? 'border-red-500' : 'border-primary focus-within:border-primary',
      ),
    disabled && 'opacity-50 pointer-events-none',
  );

  const inputClass = clsx(
    'text-center bg-transparent outline-none disabled:cursor-not-allowed',
    variant === 'calculator' &&
      'w-8 h-[44px] sm:h-auto sm:py-3 font-mukta text-[18px] font-normal leading-[30px] tracking-normal text-[#2f2f2f] placeholder:font-mukta placeholder:text-[18px] placeholder:font-normal placeholder:leading-[30px] placeholder:tracking-normal placeholder:text-[#464646]',
    variant === 'kundali' &&
      'w-7 py-0 font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph',
    variant === 'matching' &&
      'w-10 font-mukta text-[13px] md:text-[14px] text-[#141414] placeholder:text-[#7b6b69]',
  );

  const separatorClass = clsx(
    variant === 'calculator' && 'font-mukta text-[18px] font-normal leading-[30px] tracking-normal text-[#464646] mx-1',
    variant === 'kundali' && 'font-mukta text-sm md:text-base text-[#4f2620]',
    variant === 'matching' && 'font-mukta text-[13px] text-[#7b6b69]',
  );

  const selectClass = clsx(
    'bg-transparent outline-none disabled:cursor-not-allowed cursor-pointer appearance-none',
    variant === 'calculator' && 'h-[44px] sm:h-auto sm:py-3 font-mukta text-[18px] font-normal leading-[30px] tracking-normal text-[#2f2f2f] w-10 text-center',
    variant === 'kundali' && 'font-mukta text-sm md:text-base text-[#4f2620] w-8',
    variant === 'matching' && 'font-mukta text-[13px] md:text-[14px] text-[#141414]',
  );

  const iconWrapClass = clsx(
    variant === 'calculator' && 'ml-auto pr-4 text-[#5D1409] opacity-60',
    variant === 'kundali' && 'ml-auto shrink-0 text-[#4f2620] opacity-60',
    variant === 'matching' &&
      'absolute inset-y-0 right-3 flex items-center text-primary/70 pointer-events-none',
  );

  const labelClass = clsx(
    variant === 'calculator' && 'block font-mukta text-[14px] font-bold leading-[24px] tracking-normal text-[#2f2f2f] mb-1.5 sm:mb-2 sm:font-lato sm:text-[18px] sm:font-semibold sm:leading-[30px]',
    variant === 'kundali' && 'block font-mukta text-sm text-Trinary mb-2',
    variant === 'matching' && 'block font-mukta text-[12px] md:text-[13px] text-primary mb-1.5',
  );

  return (
    <div>
      <label htmlFor={`${id}-hh`} className={labelClass}>
        {label}
      </label>
      <div className={containerClass}>
        <input
          id={`${id}-hh`}
          type="text"
          inputMode="numeric"
          placeholder="hh"
          maxLength={2}
          value={value.hh}
          onChange={e => setPart('hh', e.target.value.replace(/\D/g, ''))}
          disabled={disabled}
          className={inputClass}
        />
        <span className={separatorClass}>/</span>
        <input
          id={`${id}-mm`}
          type="text"
          inputMode="numeric"
          placeholder="mm"
          maxLength={2}
          value={value.mm}
          onChange={e => setPart('mm', e.target.value.replace(/\D/g, ''))}
          disabled={disabled}
          className={inputClass}
        />
        <span className={separatorClass}>/</span>
        <select
          value={value.ampm}
          onChange={e => setPart('ampm', e.target.value)}
          disabled={disabled}
          className={selectClass}
          aria-label="am or pm"
        >
          <option value="am">am</option>
          <option value="pm">pm</option>
        </select>
        <span className={iconWrapClass}>{CLOCK_ICON}</span>
      </div>
      {error ? (
        <p
          className={clsx(
            'mt-1.5 font-mukta',
            variant === 'calculator' && 'text-[13px] text-red-600',
            variant === 'kundali' && 'text-sm text-red-600',
            variant === 'matching' && 'text-[12px] text-red-600',
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

type UnknownBirthTimeCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: BirthTimeFieldsVariant;
  className?: string;
};

export function UnknownBirthTimeCheckbox({
  checked,
  onChange,
  variant = 'calculator',
  className,
}: UnknownBirthTimeCheckboxProps) {
  const borderColor = variant === 'calculator' ? 'border-[#5D1409]' : 'border-primary';
  const textColor =
    variant === 'calculator'
      ? 'text-[#2f2f2f]'
      : variant === 'kundali'
        ? 'text-primary'
        : 'text-Trinary';

  return (
    <label
      className={clsx(
        'flex items-center gap-3 cursor-pointer font-mukta select-none',
        variant === 'calculator' && 'text-[14px] mb-2',
        variant === 'kundali' && 'text-sm mt-2 lg:mt-8 lg:mb-4',
        variant === 'matching' && 'text-[12px] md:text-[13px] mt-1',
        className,
      )}
    >
      <span
        className={clsx(
          'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors',
          borderColor,
          checked ? 'bg-[#6d1510]' : 'bg-white',
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer m-0"
        />
        {checked ? (
          <svg
            className="h-3.5 w-3.5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </span>
      <span className={textColor}>Don&apos;t know my exact birth time</span>
    </label>
  );
}
