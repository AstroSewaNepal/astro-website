'use client';

import { useState } from 'react';
import DatePickerDropdown from '@/components/pages/free-kundali/date-picker-dropdown';
import { formatDobDisplay } from '@/lib/calculators/calculator-form-types';

type CalculatorDatePickerProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function isoDateToDdMmYyyy(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

function ddMmYyyyToIso(value: string): string {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return '';
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export default function CalculatorDatePicker({
  id = 'calculator-dob',
  label = 'Enter date of birth',
  value,
  onChange,
  error,
}: CalculatorDatePickerProps) {
  const [open, setOpen] = useState(false);

  const displayValue = value ? formatDobDisplay(value) : 'Select date of birth';
  const calendarValue = isoDateToDdMmYyyy(value);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block font-mukta text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] text-[#2f2f2f] mb-1.5 sm:mb-2"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center rounded-full border border-[#c9b9aa] bg-transparent px-4 py-3 text-left font-mukta text-sm md:text-base text-[#2f2f2f] transition-colors duration-200 focus-within:border-[#5D1409] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D1409]/20"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex-1 min-w-0">{displayValue}</span>
        <svg
          className="w-5 h-5 shrink-0 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      <DatePickerDropdown
        open={open}
        onOpenChange={setOpen}
        onDateSelect={date => onChange(ddMmYyyyToIso(date))}
        value={calendarValue || undefined}
        anchorId={id}
      />
      {error ? (
        <p className="mt-2 font-mukta text-[12px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
