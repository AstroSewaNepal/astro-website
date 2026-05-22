'use client';

import { useState } from 'react';

import {
  BirthTimeFields,
  UnknownBirthTimeCheckbox,
  type BirthTimeParts,
} from '@/components/shared/birth-time-fields';
import {
  EMPTY_CALCULATOR_FORM,
  type CalculatorFormValues,
} from '@/lib/calculators/calculator-form-types';

type CalculatorBirthDetailsFormProps = {
  submitLabel: string;
  onSubmit: (values: CalculatorFormValues) => void | Promise<void>;
};

export default function CalculatorBirthDetailsForm({
  submitLabel,
  onSubmit,
}: CalculatorBirthDetailsFormProps) {
  const [form, setForm] = useState<CalculatorFormValues>(EMPTY_CALCULATOR_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof CalculatorFormValues, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const birthTimeParts: BirthTimeParts = {
    hh: form.birthTimeHH,
    mm: form.birthTimeMM,
    ampm: form.birthTimeAMPM,
  };

  const handleBirthTimeChange = (parts: BirthTimeParts) => {
    setForm(prev => ({
      ...prev,
      birthTimeHH: parts.hh,
      birthTimeMM: parts.mm,
      birthTimeAMPM: parts.ampm,
    }));
  };

  const handleUnknownBirthTimeChange = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      dontKnowTime: checked,
      ...(checked ? { birthTimeHH: '', birthTimeMM: '', birthTimeAMPM: 'am' } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!form.birthDate) {
      setError('Please enter your date of birth.');
      return;
    }
    if (!form.birthPlace.trim()) {
      setError('Please enter your birth place.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Calculation failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_CALCULATOR_FORM);
    setError('');
  };

  return (
    <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12">
      <h2 className="font-sahitya text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-bold text-[#5D1409] mb-3 sm:mb-4 md:mb-5 lg:mb-6">
        Fill up the Details
      </h2>

      <div className="rounded-[14px] sm:rounded-[16px] md:rounded-[18px] lg:rounded-[20px] border border-[#d3c2b4] bg-[#fdf8f2] p-3 sm:p-4 md:p-5 lg:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:shadow-[0_4px_12px_rgba(0,0,0,0.05)] lg:shadow-[0_6px_30px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-5 md:mb-6 lg:mb-7">
          <div>
            <label className="block font-mukta text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] text-[#2f2f2f] mb-1.5 sm:mb-2">
              Enter full name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter name"
                value={form.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                className="w-full rounded-full border border-[#c9b9aa] bg-white px-3 sm:px-3.5 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-2.75 lg:py-3.5 font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#2f2f2f] placeholder:text-[#b0a098] outline-none focus:border-[#5D1409] transition-colors pr-10"
              />
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#5D1409] opacity-60">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label className="block font-mukta text-[12px] sm:text-[13px] md:text-[14px] text-[#2f2f2f] mb-1.5 sm:mb-2">
              Select gender
            </label>
            <div className="relative">
              <select
                value={form.gender}
                onChange={e => handleChange('gender', e.target.value)}
                className="w-full appearance-none rounded-full border border-[#c9b9aa] bg-white px-3 sm:px-3.5 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-2.75 lg:py-3.5 font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#2f2f2f] outline-none focus:border-[#5D1409] transition-colors pr-10"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D1409]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-5 md:mb-6 lg:mb-7">
          <div>
            <label className="block font-mukta text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] text-[#2f2f2f] mb-1.5 sm:mb-2">
              Enter date of birth
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.birthDate}
                onChange={e => handleChange('birthDate', e.target.value)}
                className="w-full rounded-full border border-[#c9b9aa] bg-white px-3 sm:px-3.5 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-2.75 lg:py-3.5 font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#2f2f2f] outline-none focus:border-[#5D1409] transition-colors pr-10 [color-scheme:light]"
              />
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D1409] opacity-70">
                <svg
                  width="15"
                  height="15"
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
              </span>
            </div>
          </div>

          <div>
            <label className="block font-mukta text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] text-[#2f2f2f] mb-1.5 sm:mb-2">
              Enter birth place
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Where were you born?"
                value={form.birthPlace}
                onChange={e => handleChange('birthPlace', e.target.value)}
                className="w-full rounded-full border border-[#c9b9aa] bg-white px-3 sm:px-3.5 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-2.75 lg:py-3.5 font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-[#2f2f2f] placeholder:text-[#b0a098] outline-none focus:border-[#5D1409] transition-colors pr-10"
              />
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#5D1409] opacity-60">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
          <BirthTimeFields
            id="calculator-birth-time"
            variant="calculator"
            value={birthTimeParts}
            onChange={handleBirthTimeChange}
            disabled={form.dontKnowTime}
          />
        </div>

        <UnknownBirthTimeCheckbox
          variant="calculator"
          checked={form.dontKnowTime}
          onChange={handleUnknownBirthTimeChange}
        />

        {error ? (
          <p
            className="mb-3 sm:mb-4 font-mukta text-[11px] sm:text-[12px] md:text-[13px] text-[#8d1f1f]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <p className="font-mukta text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] text-[#5D1409] mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          <span className="font-bold">Note:</span> Without time of birth, we can still achieve up to{' '}
          <span className="font-bold">80% accurate</span> prediction
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] rounded-full bg-[#5D1409] font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] font-bold text-white hover:opacity-95 transition-opacity disabled:opacity-60 px-3 sm:px-4 md:px-5 lg:px-6"
          >
            {submitting ? 'Calculating…' : submitLabel}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] rounded-full border border-[#5D1409] bg-transparent font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] font-bold text-[#5D1409] hover:bg-[#5D1409]/5 transition-colors px-3 sm:px-4 md:px-5 lg:px-6"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
