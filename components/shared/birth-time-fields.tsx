'use client';

import clsx from 'clsx';

export type BirthTimeParts = {
  hh: string;
  mm: string;
  ampm: string;
};

export const EMPTY_BIRTH_TIME: BirthTimeParts = { hh: '', mm: '', ampm: 'am' };

/** Build `hh:mm am/pm` string for existing parseBirthTime helpers. */
export function birthTimePartsToInput(parts: BirthTimeParts): string {
  if (!parts.hh && !parts.mm) return '';
  const h = parts.hh || '12';
  const m = parts.mm.padStart(2, '0') || '00';
  return `${h}:${m} ${parts.ampm}`;
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
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
      'rounded-full border border-[#c9b9aa] bg-white focus-within:border-[#5D1409]',
    variant === 'kundali' &&
      clsx(
        'gap-3 rounded-full border px-4 py-3 focus-within:border-primary',
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
      'w-12 px-2 py-3 font-mukta text-[15px] text-[#2f2f2f] placeholder:text-[#b0a098]',
    variant === 'kundali' &&
      'w-10 py-0 font-mukta text-sm md:text-base text-[#4f2620] placeholder:text-Paragraph',
    variant === 'matching' &&
      'w-10 font-mukta text-[13px] md:text-[14px] text-[#141414] placeholder:text-[#7b6b69]',
  );

  const separatorClass = clsx(
    variant === 'calculator' && 'font-mukta text-[15px] text-[#b0a098]',
    variant === 'kundali' && 'font-mukta text-sm text-Paragraph',
    variant === 'matching' && 'font-mukta text-[13px] text-[#7b6b69]',
  );

  const selectClass = clsx(
    'bg-transparent outline-none disabled:cursor-not-allowed cursor-pointer',
    variant === 'calculator' && 'px-2 py-3 font-mukta text-[15px] text-[#2f2f2f]',
    variant === 'kundali' && 'font-mukta text-sm md:text-base text-[#4f2620]',
    variant === 'matching' && 'font-mukta text-[13px] md:text-[14px] text-[#141414]',
  );

  const iconWrapClass = clsx(
    variant === 'calculator' && 'ml-auto pr-4 text-[#5D1409] opacity-60',
    variant === 'kundali' && 'shrink-0 text-primary',
    variant === 'matching' && 'absolute inset-y-0 right-3 flex items-center text-primary/70 pointer-events-none',
  );

  const labelClass = clsx(
    variant === 'calculator' && 'block font-mukta text-[14px] text-[#2f2f2f] mb-1.5',
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
            variant === 'calculator' && 'text-[13px] text-[#8d1f1f]',
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
  const borderColor =
    variant === 'calculator' ? 'border-[#5D1409]' : 'border-primary';
  const fillColor = variant === 'calculator' ? 'bg-[#5D1409]' : 'bg-primary';
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
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          borderColor,
          checked ? fillColor : 'bg-transparent',
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        {checked ? <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" /> : null}
      </span>
      <span className={textColor}>Don&apos;t know my exact birth time</span>
    </label>
  );
}
