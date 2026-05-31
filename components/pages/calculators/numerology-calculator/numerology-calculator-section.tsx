'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { isoDateToVedastroDate } from '@/lib/calculators/birth-query';
import { fetchVedastroCalculator } from '@/lib/vedastro/fetch-calculator';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import CalculatorDatePicker from '@/components/pages/calculators/shared/calculator-date-picker';

const CALCULATOR_TYPES = [
  { value: 'life-path', label: 'Life Path Number' },
  { value: 'expression', label: 'Expression Number' },
  { value: 'soul-urge', label: 'Soul Urge Number' },
];

const FIELD_LABEL_CLASS =
  'mb-1 block font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] font-semibold leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[30px] tracking-normal text-[#141414]';

const ERROR_TEXT_CLASS = 'mt-0.5 h-[18px] text-xs leading-[18px] text-red-600';

const INFO_SECTIONS_CLASS = 'mt-24 w-full space-y-8';

const MUKTA_BODY_TEXT_CLASS =
  'font-mukta text-[18px] font-normal leading-[30px] tracking-normal text-[#4a423d]';

const HERO_TAGLINE_CLASS =
  'font-mukta text-[14px] font-normal leading-[24px] tracking-normal text-[#4a423d] md:text-[18px] md:leading-[30px]';

const HERO_DESCRIPTION_CLASS =
  'font-mukta text-[16px] font-normal leading-[28px] tracking-normal text-[#4a423d] md:text-[18px] md:leading-[30px]';

const INFO_BODY_CLASS = `mt-3 max-w-none text-left ${MUKTA_BODY_TEXT_CLASS}`;

const INFO_SECTIONS = [
  {
    title: 'What Is a Numerology Calculator?',
    body: 'Discover meanings in your name and birth date using Pythagorean numerology (life path, expression, and soul urge numbers).',
  },
  {
    title: 'How Does a Numerology Calculator Work?',
    body: 'Enter your full name and date of birth. Letters and dates are converted to numbers and reduced to a single digit (or master number).',
  },
];

export default function NumerologyCalculatorSection() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [calculatorType, setCalculatorType] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    birthDate: '',
    calculatorType: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const resultLabel = useMemo(() => {
    if (calculatorType === 'expression') return 'Expression Number';
    if (calculatorType === 'soul-urge') return 'Soul Urge Number';
    return 'Life Path Number';
  }, [calculatorType]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = { fullName: '', birthDate: '', calculatorType: '' };
    if (!fullName.trim()) errors.fullName = 'Please enter your full name.';
    if (!birthDate) errors.birthDate = 'Please enter your birth date.';
    if (!calculatorType) errors.calculatorType = 'Please select a report focus.';

    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setError('');
    setSubmitting(true);

    try {
      const vedastroDate = isoDateToVedastroDate(birthDate);
      if (!vedastroDate) {
        setFieldErrors(prev => ({ ...prev, birthDate: 'Invalid date of birth.' }));
        return;
      }

      const params = new URLSearchParams({
        name: fullName.trim(),
        date: vedastroDate,
        focus: calculatorType,
      });

      const api = await fetchVedastroCalculator<{
        rows: Array<{ label: string; value: string }>;
        source: string;
        result: number;
        resultLabel: string;
        note?: string;
      }>('numerology', params);

      sessionStorage.setItem(
        'numerologyCalculatorResult',
        JSON.stringify({
          fullName,
          birthDate,
          calculatorType,
          resultLabel: api.resultLabel ?? resultLabel,
          result: api.result,
          rows: api.rows,
          source: api.source,
          note: api.note,
        }),
      );

      router.push('/calculators/numerology-calculator/result');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Numerology calculation failed.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setBirthDate('');
    setCalculatorType('');
    setFieldErrors({ fullName: '', birthDate: '', calculatorType: '' });
    setError('');
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-0 pt-4 md:pt-8 pb-12">
      <div className="max-w-[1454px] mx-auto">

        {/* Hero */}
        <div className="mb-12">
          <h1 className="font-sahitya text-[22px] font-bold leading-[32px] tracking-normal text-[#4b1b16] md:text-[40px] md:leading-[1.1] lg:text-[44px]">
            Numerology Calculator
          </h1>
          <p className={`mt-3 w-full text-left ${HERO_TAGLINE_CLASS}`}>
            Discover your personal numerology profile from your full birth name and date of birth.
          </p>
          <p className={`mt-4 mb-8 w-full text-left ${HERO_DESCRIPTION_CLASS}`}>
            Enter your full name and date of birth to receive a detailed Pythagorean numerology
            reading that explains your life path, expression, soul urge, and more.
          </p>
        </div>

        {/* Form wrapper */}
        <div className="mx-auto mt-8 w-full flex flex-col items-center">
          <div className="mb-5 text-center">
            <p className="font-mukta text-[24px] font-semibold leading-[30px] tracking-normal text-primary">
              Fill up the Details
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full sm:w-[684px] flex-col gap-4 items-center rounded-[20px] sm:rounded-[40px] border pt-6 sm:pt-10 pr-5 sm:pr-[50px] pb-6 sm:pb-10 pl-5 sm:pl-[50px] shadow-[0_10px_30px_rgba(105,23,9,0.08)]"
            noValidate
          >
            {/* Full Name */}
            <div className="w-full">
              <label htmlFor="numerology-fullname" className={FIELD_LABEL_CLASS}>
                Enter full name
              </label>
              <div className="relative h-[48px] sm:h-[56px] w-full rounded-[32px] border-2 border-[#BE7B71] px-4 sm:px-5 py-3 sm:py-4">
                <input
                  id="numerology-fullname"
                  className="h-full w-full border-none bg-transparent font-mukta text-[13px] sm:text-[15px] md:text-[18px] md:leading-[30px] text-[#34211d] placeholder:text-[#464646] placeholder:font-mukta placeholder:font-semibold md:placeholder:text-[18px] md:placeholder:leading-[30px] placeholder:tracking-normal outline-none"
                  placeholder="Enter name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <p className={ERROR_TEXT_CLASS}>{fieldErrors.fullName}</p>
            </div>

            {/* Date of Birth */}
            <div className="w-full">
              <CalculatorDatePicker
                id="numerology-dob"
                value={birthDate}
                onChange={setBirthDate}
                fullWidth={true}
              />
              <p className={ERROR_TEXT_CLASS}>{fieldErrors.birthDate}</p>
            </div>

            {/* Report Focus */}
            <div className="w-full">
              <label htmlFor="numerology-type" className={FIELD_LABEL_CLASS}>
                Report focus
              </label>
              <div className="relative h-[48px] sm:h-[56px] w-full rounded-[32px] border-2 border-[#BE7B71] px-4 sm:px-5 py-3 sm:py-4 overflow-visible">
                <select
                  id="numerology-type"
                  className="h-full min-w-full w-full appearance-none border-none bg-transparent pr-10 font-mukta text-[13px] sm:text-[15px] md:text-[18px] md:leading-[30px] text-[#34211d] outline-none cursor-pointer"
                  value={calculatorType}
                  onChange={e => setCalculatorType(e.target.value)}
                >
                  <option value="" disabled>
                    Please Select Option
                  </option>
                  {CALCULATOR_TYPES.map(item => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="#7a2d2a"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <p className={ERROR_TEXT_CLASS}>{fieldErrors.calculatorType}</p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="w-full flex flex-row gap-[10px] md:gap-[75px] justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="flex h-[48px] sm:h-[60px] w-[175.5px] sm:w-[250px] items-center justify-center rounded-[32px] bg-[#5d1409] font-mukta text-[18px] font-semibold leading-[30px] tracking-normal text-white transition hover:opacity-95 disabled:opacity-60 pt-4 pb-4 px-2.5"
              >
                {submitting ? 'Calculating...' : 'Calculate'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex h-[48px] sm:h-[60px] w-[175.5px] sm:w-[250px] items-center justify-center rounded-[32px] border-2 border-[#5d1409] bg-[#fff5e3] font-mukta text-[18px] font-semibold leading-[30px] tracking-normal text-[#5d1409] transition hover:bg-[#f7e7d2] pt-4 pb-4 px-2.5"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Info sections */}
        <div className={INFO_SECTIONS_CLASS}>
          {INFO_SECTIONS.map(section => (
            <div key={section.title}>
              <h2 className="text-left font-sahitya text-[22px] font-bold leading-[1.1] text-primary">
                {section.title}
              </h2>
              <p className={INFO_BODY_CLASS}>{section.body}</p>
            </div>
          ))}
        </div>

        <CalculatorChooserSection exclude="numerology" />
      </div>
    </section>
  );
}