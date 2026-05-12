'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import NumerologyCalculatorImage from '@/components/images/calculator/numerologycalculator.png';

const CALCULATOR_TYPES = [
  { value: 'life-path', label: 'Life Path Number' },
  { value: 'expression', label: 'Expression Number' },
  { value: 'soul-urge', label: 'Soul Urge Number' },
];

const INFO_SECTIONS = [
  {
    title: 'What Is a Numerology Calculator?',
    body: 'A numerology calculator helps you discover the hidden meanings within your name and birth date. It converts letters and dates into numbers, then reveals personality insights, strengths, and destiny patterns.',
  },
  {
    title: 'What Is a Numerology Calculator?',
    body: 'This calculator can guide you in understanding your life path, expression, and soul urge. It is a simple way to connect with numerology and learn how numbers influence your choices and personality.',
  },
  {
    title: 'What Is a Numerology Calculator?',
    body: 'Use this tool to explore your inner strengths, life direction, and compatibility with others. Numerology is an ancient practice that gives you a fresh perspective on your natural talents and future path.',
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
    <section className="w-full px-3 md:px-8 pb-12">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-16">
        <div>
          <h1 className="font-sahitya text-[32px] font-bold leading-[1.1] text-primary md:text-[40px] lg:text-[44px]">
            Numerology Calculator
          </h1>
          <p className="mt-3 font-mukta text-[17px] text-[#2f2f2f] md:text-[18px]">
            Discover your life path and numerology insights from your name and date of birth.
          </p>
          <p className="mt-4 max-w-[640px] font-mukta text-[14px] leading-[1.75] text-Paragraph md:text-[16px]">
            Enter your details below to calculate your numerology profile. This tool is designed to
            help you understand your strengths, challenges, and purpose through ancient numerology.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-[24px] border border-[#b8b0a8] bg-white/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="numerology-fullname"
                  className="mb-2 block font-mukta text-[16px] font-medium text-primary"
                >
                  Enter full name
                </label>
                <div className="flex min-h-[58px] items-center rounded-full border border-[#9a524c] bg-transparent px-4 transition-colors duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <input
                    id="numerology-fullname"
                    className="min-w-0 flex-1 border-none bg-transparent py-3 text-[15px] font-mukta text-Paragraph outline-none placeholder:text-Paragraph"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="numerology-dob"
                  className="mb-2 block font-mukta text-[16px] font-medium text-primary"
                >
                  Enter date of birth
                </label>
                <div className="flex min-h-[58px] items-center rounded-full border border-[#9a524c] bg-transparent px-4 transition-colors duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <input
                    id="numerology-dob"
                    type="date"
                    className="min-w-0 flex-1 border-none bg-transparent py-3 text-[15px] font-mukta text-Paragraph outline-none placeholder:text-Paragraph"
                    placeholder="M / D / Y"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="numerology-type"
                  className="mb-2 block font-mukta text-[16px] font-medium text-primary"
                >
                  Type
                </label>
                <div className="flex min-h-[58px] items-center rounded-full border border-[#9a524c] bg-transparent px-4 transition-colors duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <select
                    id="numerology-type"
                    className="min-w-0 flex-1 border-none bg-transparent py-3 text-[15px] font-mukta text-Paragraph outline-none"
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

              {error ? <p className="text-sm text-[#8d1f1f]">{error}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="min-h-[52px] rounded-full bg-[#5D1409] px-6 py-3.5 font-mukta text-[17px] font-bold text-white transition hover:opacity-95"
                >
                  Calculate
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[52px] rounded-full border border-[#5D1409] bg-[#fff9ec] px-6 py-3.5 font-mukta text-[17px] font-bold text-[#5D1409] transition hover:bg-[#f5e9d7]"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-[#b8b0a8] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <Image
              src={NumerologyCalculatorImage}
              alt="Numerology illustration"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 520px"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1440px] space-y-6">
        {INFO_SECTIONS.map(section => (
          <div
            key={section.body}
            className="rounded-[24px] border border-[#d3c2b4] bg-white/80 p-6 shadow-[0_10px_20px_rgba(0,0,0,0.05)]"
          >
            <h2 className="font-sahitya text-[22px] font-bold leading-[1.1] text-primary">
              {section.title}
            </h2>
            <p className="mt-3 font-mukta text-[15px] leading-[1.8] text-[#4a423d]">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
