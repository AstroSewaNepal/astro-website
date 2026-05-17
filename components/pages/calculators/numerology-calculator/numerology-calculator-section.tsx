'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { isoDateToVedastroDate } from '@/lib/calculators/birth-query';
import { fetchVedastroCalculator } from '@/lib/vedastro/fetch-calculator';

const CALCULATOR_TYPES = [
  { value: 'life-path', label: 'Life Path Number' },
  { value: 'expression', label: 'Expression Number' },
  { value: 'soul-urge', label: 'Soul Urge Number' },
];

const FORM_OUTLINE_CLASS =
  'box-border mx-auto mt-2 flex w-full max-w-[399px] min-h-[368px] flex-col gap-10 rounded-[16px] border border-Trinary bg-transparent py-4 px-4 md:max-w-[684px] md:min-h-[518px] md:gap-9 md:rounded-[40px] md:py-10 md:px-[50px]';

const FIELD_LABEL_CLASS =
  'mb-1.5 block font-mukta text-[18px] font-semibold leading-[30px] tracking-normal text-[#141414]';

const FORM_FOOTER_CLASS = '-mt-2 flex flex-col gap-1.5';

const ERROR_SLOT_CLASS =
  'min-h-[24px] font-mukta text-sm leading-[24px] text-[#8d1f1f]';

const INFO_SECTIONS_CLASS = 'mt-24 w-full space-y-8';

const MUKTA_BODY_TEXT_CLASS =
  'font-mukta text-[18px] font-normal leading-[30px] tracking-normal text-[#4a423d]';

const HERO_TAGLINE_CLASS =
  'font-mukta text-[14px] font-normal leading-[24px] tracking-normal text-[#4a423d] md:text-[18px] md:leading-[30px]';

const HERO_DESCRIPTION_CLASS =
  'font-mukta text-[16px] font-normal leading-[28px] tracking-normal text-[#4a423d] md:text-[18px] md:leading-[30px]';

const FORM_HEADING_CLASS =
  'text-left font-sahitya text-[22px] font-bold leading-[32px] tracking-normal text-[#7c211a] md:font-mukta md:text-[24px] md:font-semibold md:leading-[30px]';

const INFO_BODY_CLASS = `mt-3 max-w-none text-left ${MUKTA_BODY_TEXT_CLASS}`;

const CALCULATE_BUTTON_CLASS =
  'box-border flex h-[60px] w-[250px] items-center justify-center gap-[10px] rounded-[32px] bg-[#5d1409] py-4 px-[10px] font-mukta text-[17px] font-bold text-white transition hover:opacity-95 disabled:opacity-60';

const RESET_BUTTON_CLASS =
  'box-border flex h-[60px] w-[250px] items-center justify-center gap-[10px] rounded-[32px] border-2 border-[#5d1409] bg-[#fff5e3] py-4 px-[10px] font-mukta text-[17px] font-bold text-[#5d1409] transition hover:bg-[#f7e7d2]';

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
  const [calculatorType, setCalculatorType] = useState(CALCULATOR_TYPES[0].value);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resultLabel = useMemo(() => {
    if (calculatorType === 'expression') return 'Expression Number';
    if (calculatorType === 'soul-urge') return 'Soul Urge Number';
    return 'Life Path Number';
  }, [calculatorType]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName.trim() || !birthDate) {
      setError('Please enter your full name and birth date.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const vedastroDate = isoDateToVedastroDate(birthDate);
      if (!vedastroDate) {
        setError('Invalid date of birth.');
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
    setCalculatorType(CALCULATOR_TYPES[0].value);
    setError('');
  };

  return (
    <section className="w-full px-3 pb-12 md:px-8">
      <div className="mx-auto max-w-[1440px]">
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

        <div className="mx-auto mt-8 w-full max-w-[399px] md:max-w-[684px]">
          <div className="mb-4">
            <p className={FORM_HEADING_CLASS}>Fill up the Details</p>
          </div>

          <form onSubmit={handleSubmit} className={FORM_OUTLINE_CLASS}>
            <div>
              <label htmlFor="numerology-fullname" className={FIELD_LABEL_CLASS}>
                Enter full name
              </label>
              <div className="flex h-[56px] items-center gap-2 rounded-[32px] border-2 border-[#aa4c44] px-5 py-4">
                <input
                  id="numerology-fullname"
                  className="min-w-0 flex-1 border-none bg-transparent text-[15px] font-mukta text-[#34211d] outline-none"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="numerology-dob" className={FIELD_LABEL_CLASS}>
                Enter date of birth
              </label>
              <div className="flex h-[56px] items-center gap-2 rounded-[32px] border-2 border-[#aa4c44] px-5 py-4">
                <input
                  id="numerology-dob"
                  type="date"
                  className="min-w-0 flex-1 border-none bg-transparent text-[15px] font-mukta text-[#34211d] outline-none"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="numerology-type" className={FIELD_LABEL_CLASS}>
                Report focus
              </label>
              <div className="relative flex h-[56px] items-center rounded-[32px] border-2 border-[#aa4c44] px-5 py-4">
                <select
                  id="numerology-type"
                  className="min-w-0 flex-1 appearance-none border-none bg-transparent text-[15px] font-mukta text-[#34211d] outline-none"
                  value={calculatorType}
                  onChange={e => setCalculatorType(e.target.value)}
                >
                  {CALCULATOR_TYPES.map(item => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={FORM_FOOTER_CLASS}>
              <p className={ERROR_SLOT_CLASS} role="alert">
                {error || '\u00a0'}
              </p>
              <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </section>
  );
}
