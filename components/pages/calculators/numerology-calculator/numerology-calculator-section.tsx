'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { isoDateToVedastroDate } from '@/lib/calculators/birth-query';
import { fetchVedastroCalculator } from '@/lib/vedastro/fetch-calculator';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import CalculatorDatePicker from '@/components/pages/calculators/shared/calculator-date-picker';
import QNASComponent from '@/components/common/qnas-component';

const CALCULATOR_TYPES = [
  { value: 'life-path', label: 'Life Path Number' },
  { value: 'expression', label: 'Expression Number' },
  { value: 'soul-urge', label: 'Soul Urge Number' },
];

const FIELD_LABEL_CLASS = 'mb-2 block font-mukta text-sm text-Trinary';

const ERROR_TEXT_CLASS = 'mt-0.5 h-[18px] text-xs leading-[18px] text-red-600';

const INFO_SECTIONS = [
  {
    title: 'What Is Numerology?',
    body: 'Numerology is the study of how numbers derived from your name and birth date reveal patterns in your personality, life purpose, and inner motivations. The Pythagorean system assigns a value from 1 to 9 to each letter of the alphabet. These values are then used to calculate three core numbers.\n\nLife Path Number: Derived from your birth date. The most significant number in your chart. It describes your core purpose and the main themes running through your life.\n\nExpression Number: Derived from your full birth name. It reflects your natural abilities and the way you express yourself in the world.\n\nSoul Urge Number: Derived from only the vowels in your name. It reveals your deepest desires and inner motivations.',
  },
  {
    title: 'How Is My Number Calculated?',
    body: 'Each letter in the Pythagorean system has a fixed number value from 1 to 9. Your name is converted letter by letter, and the resulting digits are added together and reduced to a single digit. Master numbers (11, 22, and 33) are not reduced further because they carry special significance. Your birth date digits are summed and reduced the same way for your Life Path Number. This calculator does the maths instantly.',
  },
  {
    title: 'What Are Master Numbers?',
    body: 'Master numbers are 11, 22, and 33. When your Life Path Number or Expression Number reduces to one of these, it is not reduced further to a single digit. Master numbers are considered to carry amplified energy and greater potential. Number 11 is associated with intuition and spiritual insight. Number 22 is associated with building and practical mastery. Number 33 is associated with compassion and teaching. Not everyone has a master number and that is not a disadvantage. Single digit numbers are equally powerful.',
  },
  {
    title: 'Which Name Should I Use?',
    body: 'Use your full birth name as it appears on your birth certificate, including any middle names. Do not use a nickname or a married name. The birth name carries the numerological signature you were born with. If you have changed your name legally, some numerologists will calculate both the birth name and the current name to see how the energies interact, but the birth name is always the starting point.',
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
    <section className="pt-6 md:pt-12 pb-12">
      <div>
        {/* Hero */}
        <div className="mb-6 md:mb-[50px]">
          <h1 className="font-tiro-devanagari font-bold text-[26px] leading-[1.2] md:text-[36px] lg:text-[44px] text-primary">
            Numerology Calculator: Find Your Life Path and Core Numbers
          </h1>
          <p className="mt-[10px] md:mt-6 font-mukta font-normal text-[14px] leading-[1.2] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
            Calculate your Life Path Number, Expression Number, and Soul Urge Number using
            Pythagorean numerology.
          </p>
          <p className="mt-4 md:mt-6 font-mukta font-normal text-[14px] leading-[1.5] tracking-[0.02em] md:text-[16px] lg:text-[18px] text-[#4a423d]">
            Enter your full name and date of birth. Birthplace is not needed for this calculator.
          </p>
        </div>

        {/* Form wrapper */}
        <div className="mx-auto mt-6 md:mt-[50px] w-full flex flex-col items-center">
          <div className="mb-5 text-center">
            <p className="font-mukta text-[24px] font-semibold leading-[30px] tracking-[0.02em] text-primary">
              Enter Your Details
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full sm:w-[684px] flex-col gap-4 items-center rounded-[20px] sm:rounded-[40px] border border-[#BE7B71] pt-6 sm:pt-10 pr-5 sm:pr-[50px] pb-6 sm:pb-10 pl-5 sm:pl-[50px] shadow-[0_10px_30px_rgba(105,23,9,0.08)]"
            noValidate
          >
            {/* Full Name */}
            <div className="w-full">
              <label htmlFor="numerology-fullname" className={FIELD_LABEL_CLASS}>
                Enter full name
              </label>
              <div className="flex h-[52px] box-border items-center overflow-hidden rounded-[32px] border border-[#BE7B71] bg-transparent px-[16px] transition-colors duration-200 focus-within:border-[#BE7B71] focus-within:ring-1 focus-within:ring-[#BE7B71]/20">
                <input
                  id="numerology-fullname"
                  className="min-w-0 flex-1 h-full border-none bg-transparent font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] text-[#2f2f2f] outline-none placeholder:text-[#464646]"
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
              <div className="relative w-full">
                <select
                  id="numerology-type"
                  className="h-[52px] w-full appearance-none rounded-[32px] border border-[#BE7B71] bg-transparent px-[16px] pr-10 font-mukta text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] leading-[24px] text-[#2f2f2f] outline-none cursor-pointer transition-colors duration-200"
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Buttons */}
            <div className="w-full flex flex-row gap-[10px] md:gap-[75px] justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="flex h-[48px] sm:h-[60px] w-[175.5px] sm:w-[250px] items-center justify-center rounded-[32px] bg-[#5d1409] font-mukta text-[18px] font-semibold leading-[30px] tracking-normal text-white transition hover:opacity-95 disabled:opacity-60 pt-4 pb-4 px-2.5"
              >
                {submitting ? (
                  'Calculating...'
                ) : (
                  <>
                    <span className="sm:hidden">Calculate</span>
                    <span className="hidden sm:inline">Calculate My Numbers</span>
                  </>
                )}
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

        <CalculatorChooserSection exclude="numerology" />

        {/* FAQ */}
        <section className="mt-16 border-b border-b-[#79787A] pt-12 pb-[100px]">
          <div className="flex flex-col items-center justify-center gap-4 md:gap-5 lg:gap-6 text-center">
            <h2 className="text-[34px] md:text-[40px] lg:text-[56px] leading-[42px] md:leading-[47.83px] font-normal text-primary text-center">
              Frequently Asked Questions
            </h2>
            <p className="font-mukta text-base md:text-lg lg:text-xl xl:text-2xl leading-6 md:leading-7 text-[#000000CF] opacity-80 max-w-[800px] text-center mt-2 md:mt-4 lg:mt-6 px-4">
              Find quick answers to common questions about our numerology calculator and how to use
              your core numbers.
            </p>
          </div>
          <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-6 lg:space-y-[34px]">
            {INFO_SECTIONS.map(section => (
              <QNASComponent
                key={section.title}
                question={section.title}
                answer={section.body}
                isDefaultOpen={section.title === 'What Is Numerology?'}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
