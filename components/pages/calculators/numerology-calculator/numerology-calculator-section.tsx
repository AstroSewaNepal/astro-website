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

const FORM_OUTLINE_CLASS =
  'box-border mx-auto mt-2 flex w-full max-w-[399px] sm:max-w-[480px] md:max-w-[680px] lg:max-w-[800px] flex-col gap-4 rounded-[12px] border border-Trinary bg-transparent py-4 px-4 sm:px-5 md:px-6 lg:px-8';

const FIELD_LABEL_CLASS =
  'mb-1 sm:mb-1.5 block font-mukta text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] font-semibold leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[30px] tracking-normal text-[#141414]';

const FORM_FOOTER_CLASS = '-mt-2 flex flex-col gap-1.5';

const ERROR_SLOT_CLASS = 'min-h-[24px] font-mukta text-sm leading-[24px] text-red-600';

const INFO_SECTIONS_CLASS = 'mt-24 w-full space-y-8';

const MUKTA_BODY_TEXT_CLASS =
  'font-mukta text-[18px] font-normal leading-[30px] tracking-normal text-[#4a423d]';

const HERO_TAGLINE_CLASS =
  'font-mukta text-[14px] font-normal leading-[24px] tracking-normal text-[#4a423d] md:text-[18px] md:leading-[30px]';

const HERO_DESCRIPTION_CLASS =
  'font-mukta text-[16px] font-normal leading-[28px] tracking-normal text-[#4a423d] md:text-[18px] md:leading-[30px]';

const INFO_BODY_CLASS = `mt-3 max-w-none text-left ${MUKTA_BODY_TEXT_CLASS}`;

const CALCULATE_BUTTON_CLASS =
  'box-border flex h-[40px] sm:h-[48px] md:h-[52px] lg:h-[60px] w-full items-center justify-center gap-[10px] rounded-[24px] sm:rounded-[28px] md:rounded-[30px] lg:rounded-[32px] bg-[#5d1409] py-2.5 sm:py-3 md:py-3 lg:py-4 px-4 sm:px-5 md:px-6 lg:px-8 font-mukta text-[12px] sm:text-[13px] md:text-[15px] lg:text-[17px] font-bold text-white transition hover:opacity-95 disabled:opacity-60';

const RESET_BUTTON_CLASS =
  'box-border flex h-[40px] sm:h-[48px] md:h-[52px] lg:h-[60px] w-full items-center justify-center gap-[10px] rounded-[24px] sm:rounded-[28px] md:rounded-[30px] lg:rounded-[32px] border-2 border-[#5d1409] bg-[#fff5e3] py-2.5 sm:py-3 md:py-3 lg:py-4 px-4 sm:px-5 md:px-6 lg:px-8 font-mukta text-[12px] sm:text-[13px] md:text-[15px] lg:text-[17px] font-bold text-[#5d1409] transition hover:bg-[#f7e7d2]';

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
    <section className="container mx-auto px-6 lg:px-0 pt-4 md:pt-8 pb-12">
      <div className="max-w-[1454px] mx-auto">
        <div>
          <h1 className="font-sahitya text-[22px] font-bold leading-[32px] tracking-normal text-[#4b1b16] md:text-[40px] md:leading-[1.1] lg:text-[44px]">
            Numerology Calculator
          </h1>
          <p className={`mt-3 w-full text-left ${HERO_TAGLINE_CLASS}`}>
            Pythagorean numerology from your name and birth date.
          </p>
          <p className={`mt-4 mb-8 w-full text-left ${HERO_DESCRIPTION_CLASS}`}>
            Enter your full name and date of birth — birth place is not required.
          </p>
        </div>

        <div className="mx-auto mt-6 sm:mt-7 md:mt-8 lg:mt-10 w-full max-w-[399px] sm:max-w-[480px] md:max-w-[680px] lg:max-w-[800px]">
          <div className="mb-3 sm:mb-4 md:mb-5 px-0 sm:px-0 md:px-0">
            <p className="font-sahitya text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-bold leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[30px] text-primary">
              Fill up the Details
            </p>
          </div>

          <form onSubmit={handleSubmit} className={FORM_OUTLINE_CLASS}>
            <div>
              <label htmlFor="numerology-fullname" className={FIELD_LABEL_CLASS}>
                Enter full name
              </label>
              <div className="flex h-[40px] sm:h-[44px] md:h-[48px] lg:h-[56px] items-center gap-2 rounded-[22px] sm:rounded-[26px] md:rounded-[28px] lg:rounded-[32px] border-2 border-[#aa4c44] px-4 sm:px-4.5 md:px-5 lg:px-5 py-2.5 sm:py-3 md:py-3 lg:py-4">
                <input
                  id="numerology-fullname"
                  className="min-w-0 flex-1 border-none bg-transparent text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] font-mukta text-[#34211d] outline-none"
                  placeholder="Enter name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <p className="mt-1 text-sm text-red-600 min-h-[20px]">
                {fieldErrors.fullName || '\u00a0'}
              </p>
            </div>

            <div>
              <CalculatorDatePicker id="numerology-dob" value={birthDate} onChange={setBirthDate} />
              <p className="mt-1 text-sm text-red-600 min-h-[20px]">
                {fieldErrors.birthDate || '\u00a0'}
              </p>
            </div>

            <div>
              <label htmlFor="numerology-type" className={FIELD_LABEL_CLASS}>
                Report focus
              </label>
              <div className="relative flex h-[40px] sm:h-[44px] md:h-[48px] lg:h-[56px] items-center rounded-[22px] sm:rounded-[26px] md:rounded-[28px] lg:rounded-[32px] border-2 border-[#aa4c44] px-4 sm:px-4.5 md:px-5 lg:px-5 py-2.5 sm:py-3 md:py-3 lg:py-4">
                <select
                  id="numerology-type"
                  className="min-w-0 flex-1 appearance-none border-none bg-transparent text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] font-mukta text-[#34211d] outline-none pr-10 cursor-pointer"
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
                <span className="pointer-events-none absolute right-3 bottom-3 text-[#34211d]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
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
              <p className="mt-1 text-sm text-red-600 min-h-[20px]">
                {fieldErrors.calculatorType || '\u00a0'}
              </p>
            </div>

            <div className={FORM_FOOTER_CLASS}>
              <p className={ERROR_SLOT_CLASS} role="alert">
                {error || '\u00a0'}
              </p>
              <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" disabled={submitting} className={CALCULATE_BUTTON_CLASS}>
                  {submitting ? 'Calculating…' : 'Calculate'}
                </button>
                <button type="button" onClick={handleReset} className={RESET_BUTTON_CLASS}>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

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
