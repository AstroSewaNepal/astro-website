'use client';

import { useState } from 'react';

import {
  DEFAULT_UNKNOWN_BIRTH_TIME,
  UnknownBirthTimeCheckbox,
  type BirthTimeParts,
} from '@/components/shared/birth-time-fields';
import { ClockTimePicker } from '@/components/shared/clock-time-picker';

import CalculatorDatePicker from '@/components/pages/calculators/shared/calculator-date-picker';
import { CityAutocompleteInput } from '@/components/shared/city-autocomplete-input';
import {
  EMPTY_CALCULATOR_FORM,
  type CalculatorFormValues,
} from '@/lib/calculators/calculator-form-types';
import { setCalculatorSelectedCity } from '@/lib/calculators/birth-query';
import type { CitySearchResult } from '@/lib/city-search-api';

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
  const [selectedBirthCity, setSelectedBirthCity] = useState<CitySearchResult | null>(null);

  const handleChange = (field: keyof CalculatorFormValues, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (['fullName', 'gender', 'birthDate', 'birthPlace'].includes(field as string)) {
      setFieldErrors(prev => ({ ...prev, [field as keyof typeof prev]: '' }));
    }
    if (field === 'birthPlace') {
      setSelectedBirthCity(null);
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
      ...(checked
        ? {
            birthTimeHH: DEFAULT_UNKNOWN_BIRTH_TIME.hh,
            birthTimeMM: DEFAULT_UNKNOWN_BIRTH_TIME.mm,
            birthTimeAMPM: DEFAULT_UNKNOWN_BIRTH_TIME.ampm,
          }
        : {}),
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
      setCalculatorSelectedCity(selectedBirthCity);
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
    setSelectedBirthCity(null);
    setCalculatorSelectedCity(null);
    setError('');
  };

  return (
    <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12">
      <h2 className="font-mukta text-[18px] font-semibold leading-[28px] tracking-normal sm:font-sahitya sm:text-[28px] sm:font-bold sm:leading-[38px] text-[#5D1409] mb-3 sm:mb-4 md:mb-5 lg:mb-6">
        Fill up the Details
      </h2>

      <div className="rounded-[32px] border border-[#BE7B71] bg-transparent p-4 sm:p-5 md:p-6 lg:p-8 shadow-[0_10px_30px_rgba(105,23,9,0.08)]">
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 md:gap-x-5 lg:gap-x-6 gap-y-0 sm:gap-y-1 lg:gap-y-2 mb-2 sm:mb-3">
          <div>
            <label className="block font-mukta text-[14px] font-bold leading-[24px] tracking-normal text-[#2f2f2f] mb-1.5 sm:mb-2 sm:font-lato sm:text-[18px] sm:font-semibold sm:leading-[30px]">
              Enter full name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter name"
                value={form.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                className="w-full rounded-[32px] border-2 sm:border border-[#BE7B71] bg-transparent px-4 h-[48px] sm:h-auto sm:py-3 font-mukta text-[18px] font-normal leading-[30px] tracking-normal text-[#2f2f2f] placeholder:font-mukta placeholder:text-[18px] placeholder:font-normal placeholder:leading-[30px] placeholder:tracking-normal placeholder:text-[#464646] outline-none focus:border-[#A13924] focus:ring-2 focus:ring-[#A13924]/10 transition-colors pr-10"
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
            <p
              className="mt-1 sm:mt-2 font-mukta text-[12px] text-red-600 min-h-[16px] sm:min-h-[18px]"
              role="alert"
            >
              {fieldErrors.fullName || '\u00a0'}
            </p>
          </div>

          <div>
            <label className="block font-mukta text-[14px] font-bold leading-[24px] tracking-normal text-[#2f2f2f] mb-1.5 sm:mb-2 sm:font-lato sm:text-[18px] sm:font-semibold sm:leading-[30px]">
              Select gender
            </label>
            <div className="relative">
              <select
                value={form.gender}
                onChange={e => handleChange('gender', e.target.value)}
                className="w-full appearance-none rounded-[32px] border-2 sm:border border-[#BE7B71] bg-transparent px-4 h-[48px] sm:h-auto sm:py-3 font-mukta text-[18px] font-normal leading-[30px] tracking-normal text-[#2f2f2f] outline-none focus:border-[#A13924] focus:ring-2 focus:ring-[#A13924]/10 transition-colors pr-10"
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
            <p
              className="mt-1 sm:mt-2 font-mukta text-[12px] text-red-600 min-h-[16px] sm:min-h-[18px]"
              role="alert"
            >
              {fieldErrors.gender || '\u00a0'}
            </p>
          </div>

          <div>
            <CalculatorDatePicker
              id="calculator-dob"
              value={form.birthDate}
              onChange={value => handleChange('birthDate', value)}
              error={fieldErrors.birthDate}
              fullWidth
            />
          </div>

          <div>
            <CityAutocompleteInput
              label="Enter birth place"
              placeholder="Where were you born?"
              value={form.birthPlace}
              onChange={value => handleChange('birthPlace', value)}
              onCitySelect={city => {
                setSelectedBirthCity(city);
                setFieldErrors(prev => ({ ...prev, birthPlace: '' }));
              }}
              error={fieldErrors.birthPlace}
            />
          </div>
          <div className="col-span-2">
            <ClockTimePicker
              id="calculator-birth-time"
              label="Enter birth time"
              value={birthTimeParts}
              onChange={handleBirthTimeChange}
              disabled={form.dontKnowTime}
              variant="calculator"
              error={fieldErrors.birthTime}
            />
          </div>
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

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full min-h-[40px] sm:min-h-[44px] md:min-h-[48px] lg:min-h-[52px] rounded-full bg-[#5D1409] font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] font-bold text-white hover:opacity-95 transition-opacity disabled:opacity-60 px-3 sm:px-4 md:px-5 lg:px-6"
          >
            <span className="sm:hidden">{submitting ? 'Calculating…' : 'Calculate'}</span>
            <span className="hidden sm:inline">{submitting ? 'Calculating…' : submitLabel}</span>
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
