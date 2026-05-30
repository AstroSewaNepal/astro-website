'use client';

import { useState } from 'react';

import {
  UnknownBirthTimeCheckbox,
  type BirthTimeParts,
} from '@/components/shared/birth-time-fields';
import { ClockTimePicker } from '@/components/shared/clock-time-picker';
import CalculatorDatePicker from '@/components/pages/calculators/shared/calculator-date-picker';
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
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    birthTime: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof CalculatorFormValues, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (['fullName', 'gender', 'birthDate', 'birthPlace'].includes(field as string)) {
      setFieldErrors(prev => ({ ...prev, [field as keyof typeof prev]: '' }));
    }
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
    setFieldErrors(prev => ({ ...prev, birthTime: '' }));
  };

  const handleUnknownBirthTimeChange = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      dontKnowTime: checked,
      ...(checked ? { birthTimeHH: '', birthTimeMM: '', birthTimeAMPM: 'am' } : {}),
    }));
    if (checked) {
      setFieldErrors(prev => ({ ...prev, birthTime: '' }));
    }
  };

  const handleSubmit = async () => {
    const errors = {
      fullName: '',
      gender: '',
      birthDate: '',
      birthPlace: '',
      birthTime: '',
    };

    if (!form.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }
    if (!form.gender) {
      errors.gender = 'Please select your gender.';
    }
    if (!form.birthDate) {
      errors.birthDate = 'Please enter your date of birth.';
    }
    if (!form.birthPlace.trim()) {
      errors.birthPlace = 'Please enter your birth place.';
    }

    if (!form.dontKnowTime && (!form.birthTimeHH || !form.birthTimeMM)) {
      errors.birthTime = 'Birth time is required, or check "Don\'t know my exact birth time".';
    }

    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (submitError) {
      if (submitError instanceof Error) {
        const message = submitError.message;
        if (message.includes('birth place')) {
          setFieldErrors(prev => ({ ...prev, birthPlace: message }));
        } else if (message.includes('date of birth')) {
          setFieldErrors(prev => ({ ...prev, birthDate: message }));
        } else {
          setError(message);
        }
      } else {
        setError('Calculation failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_CALCULATOR_FORM);
    setFieldErrors({ fullName: '', gender: '', birthDate: '', birthPlace: '', birthTime: '' });
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
            <p className="mt-2 font-mukta text-[12px] text-red-600 min-h-[18px]" role="alert">
              {fieldErrors.fullName || '\u00a0'}
            </p>
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
            <p className="mt-2 font-mukta text-[12px] text-red-600 min-h-[18px]" role="alert">
              {fieldErrors.gender || '\u00a0'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-5 md:mb-6 lg:mb-7">
          <div>
            <CalculatorDatePicker
              id="calculator-dob"
              value={form.birthDate}
              onChange={value => handleChange('birthDate', value)}
              error={fieldErrors.birthDate}
            />
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
            <p className="mt-2 font-mukta text-[12px] text-red-600 min-h-[18px]" role="alert">
              {fieldErrors.birthPlace || '\u00a0'}
            </p>
          </div>
        </div>

        <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
          <ClockTimePicker
            id="calculator-birth-time"
            label="Enter birth time"
            value={birthTimeParts}
            onChange={handleBirthTimeChange}
            disabled={form.dontKnowTime}
          />
          <p className="mt-2 font-mukta text-[12px] text-red-600 min-h-[18px]" role="alert">
            {fieldErrors.birthTime || '\u00a0'}
          </p>
        </div>

        <UnknownBirthTimeCheckbox
          variant="calculator"
          checked={form.dontKnowTime}
          onChange={handleUnknownBirthTimeChange}
        />

        {error ? (
          <p
            className="mb-3 sm:mb-4 font-mukta text-[11px] sm:text-[12px] md:text-[13px] text-red-600"
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
