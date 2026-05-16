'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  'box-border flex h-[60px] w-[250px] items-center justify-center gap-[10px] rounded-[32px] bg-[#5d1409] py-4 px-[10px] font-mukta text-[17px] font-bold text-white transition hover:opacity-95';

const RESET_BUTTON_CLASS =
  'box-border flex h-[60px] w-[250px] items-center justify-center gap-[10px] rounded-[32px] border-2 border-[#5d1409] bg-[#fff5e3] py-4 px-[10px] font-mukta text-[17px] font-bold text-[#5d1409] transition hover:bg-[#f7e7d2]';

const INFO_SECTIONS = [
  {
    title: 'What Is a Numerology Calculator?',
    body: 'A numerology calculator helps you discover the hidden meanings within your name and birth date. It converts letters and dates into numbers, then reveals personality insights, strengths, and destiny patterns.',
  },
  {
    title: 'How Does a Numerology Calculator Work?',
    body: 'You enter your full name and date of birth, and the calculator maps each letter to a number using a standard numerology chart. Those values are reduced to single digits (or master numbers) to produce your life path, expression, and soul urge results.',
  },
  {
    title: 'What Is a Life Path Number?',
    body: 'Your life path number is derived from your birth date and reflects your core purpose, natural talents, and the lessons you are meant to learn in this lifetime. It is one of the most important numbers in numerology for understanding your overall direction.',
  },
  {
    title: 'What Are Expression and Soul Urge Numbers?',
    body: 'The expression number comes from your full birth name and shows how you present yourself and what you are capable of achieving. The soul urge number, based on the vowels in your name, reveals your inner desires, motivations, and what truly fulfills you.',
  },
  {
    title: 'Why Use a Numerology Calculator?',
    body: 'A numerology calculator offers quick, clear insights without needing to study charts or do manual calculations. Whether you are exploring self-growth, relationships, or life decisions, it helps you see patterns in your numbers and reflect on your strengths and challenges.',
  },
];

function reduceToOneDigit(value: string) {
  let sum = 0;
  for (const char of value) {
    const digit = Number(char);
    if (!Number.isNaN(digit)) {
      sum += digit;
    }
  }

  while (sum > 9) {
    let next = 0;
    for (const char of String(sum)) {
      next += Number(char);
    }
    sum = next;
  }

  return sum;
}

function getLifePathNumber(dateValue: string) {
  if (!dateValue) return null;
  const digits = dateValue.replace(/-/g, '');
  if (!/^[0-9]{8}$/.test(digits)) return null;
  return reduceToOneDigit(digits);
}

export default function NumerologyCalculatorSection() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [calculatorType, setCalculatorType] = useState(CALCULATOR_TYPES[0].value);
  const [error, setError] = useState('');

  const resultLabel = useMemo(() => {
    if (calculatorType === 'expression') return 'Expression Number';
    if (calculatorType === 'soul-urge') return 'Soul Urge Number';
    return 'Life Path Number';
  }, [calculatorType]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName.trim() || !birthDate) {
      setError('Please enter your full name and birth date.');
      return;
    }

    setError('');
    const lifePathNumber = getLifePathNumber(birthDate);
    const finalResult = lifePathNumber || 0;

    sessionStorage.setItem(
      'numerologyCalculatorResult',
      JSON.stringify({
        fullName,
        birthDate,
        calculatorType,
        result: finalResult,
        resultLabel,
      }),
    );

    router.push('/calculators/numerology-calculator/result');
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
            Ever wondered what your name and birth date reveal about you?
          </p>
          <p className={`mt-4 mb-8 w-full text-left ${HERO_DESCRIPTION_CLASS}`}>
            Discover your life path and numerology insights from your name and date of birth. This calculator helps you explore your strengths, purpose, and personality through the power of numbers, revealing patterns linked to your character, talents, relationships, and long-term direction. Enter your details below to understand yourself more deeply and see what your numbers say about you.
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
                <div className="flex h-[56px] items-center gap-2 rounded-[32px] border-2 border-[#aa4c44] px-5 py-4 text-[#4a2c28] shadow-sm transition duration-200 focus-within:border-[#8a372f]">
                  <input
                    id="numerology-fullname"
                    className="min-w-0 flex-1 border-none bg-transparent text-[15px] font-mukta text-[#34211d] outline-none placeholder:text-[#b18576]"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                  <span className="text-[#9d675e]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="numerology-dob" className={FIELD_LABEL_CLASS}>
                  Enter date of birth
                </label>
                <div className="flex h-[56px] items-center gap-2 rounded-[32px] border-2 border-[#aa4c44] px-5 py-4 text-[#4a2c28] shadow-sm transition duration-200 focus-within:border-[#8a372f]">
                  <input
                    id="numerology-dob"
                    type="date"
                    className="min-w-0 flex-1 border-none bg-transparent text-[15px] font-mukta text-[#34211d] outline-none placeholder:text-[#b18576]"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                  />
                  <span className="text-[#9d675e]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="numerology-type" className={FIELD_LABEL_CLASS}>
                  Type
                </label>
                <div className="relative flex h-[56px] items-center rounded-[32px] border-2 border-[#aa4c44] px-5 py-4 text-[#4a2c28] shadow-sm transition duration-200 focus-within:border-[#8a372f]">
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
                  <span className="pointer-events-none text-[#9d675e]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </div>
              </div>

              <div className={FORM_FOOTER_CLASS}>
                <p className={ERROR_SLOT_CLASS} role="alert" aria-live="polite">
                  {error || '\u00a0'}
                </p>
                <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" className={CALCULATE_BUTTON_CLASS}>
                    Calculate
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
