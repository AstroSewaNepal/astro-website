'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import CalculatorCard from '../calculator-card';
import LoveHeroImage from '@/components/images/lovecalculator.png';
import NumerologyCalculatorImage from '@/components/images/calculator/numerologycalculator.png';
import SunSignCalculatorImage from '@/components/images/calculator/sunsigncalculator.png';
import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';

const MEANINGS: Record<string, string> = {
  'life-path':
    'Your Life Path Number reveals your core purpose and the major lessons you are learning in this lifetime.',
  expression:
    'Your Expression Number describes natural talents, skills, and the way you express yourself to the world.',
  'soul-urge':
    'Your Soul Urge Number shows your deepest motivations, inner desires, and what truly matters to you.',
};

type NumerologyResult = {
  fullName: string;
  birthDate: string;
  calculatorType: string;
  result: number;
  resultLabel: string;
};

export default function NumerologyCalculatorResultSection() {
  const router = useRouter();
  const [data] = useState<NumerologyResult | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = sessionStorage.getItem('numerologyCalculatorResult');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const handleCalculateAgain = () => {
    router.push('/calculators/numerology-calculator');
  };

  if (!data) {
    return (
      <section className="w-full px-3 md:px-8 pb-12">
        <div className="mx-auto max-w-[1440px] rounded-[24px] border border-[#d3c2b4] bg-white/90 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <h1 className="font-sahitya text-[32px] font-bold text-primary md:text-[40px]">
            Numerology Result
          </h1>
          <p className="mt-4 font-mukta text-[16px] text-[#2f2f2f]">
            No result found yet. Please go back and calculate your numerology profile first.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCalculateAgain}
              className="rounded-full bg-[#5D1409] px-8 py-3.5 font-mukta text-[17px] font-bold text-white hover:opacity-95"
            >
              Go to Numerology Calculator
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-3 md:px-8 pb-12">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-16">
        <div>
          <h1 className="font-sahitya text-[32px] font-bold leading-[1.1] text-primary md:text-[40px] lg:text-[44px]">
            Numerology Result
          </h1>
          <p className="mt-3 font-mukta text-[17px] text-[#2f2f2f] md:text-[18px]">
            Here is your numerology profile based on the information you entered.
          </p>

          <div className="mt-8 space-y-6 rounded-[24px] border border-[#b8b0a8] bg-white/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div>
              <p className="font-mukta text-[15px] text-[#6d6d6d]">Full Name</p>
              <p className="mt-1 font-sahitya text-[22px] text-primary">{data.fullName}</p>
            </div>
            <div>
              <p className="font-mukta text-[15px] text-[#6d6d6d]">Date of Birth</p>
              <p className="mt-1 font-sahitya text-[22px] text-primary">{data.birthDate}</p>
            </div>
            <div>
              <p className="font-mukta text-[15px] text-[#6d6d6d]">Type</p>
              <p className="mt-1 font-sahitya text-[22px] text-primary">{data.resultLabel}</p>
            </div>
            <div className="rounded-[20px] border border-[#e5c5b9] bg-[#fff8f2] p-5">
              <p className="font-sahitya text-[20px] font-bold text-[#5d1409]">Your Number</p>
              <p className="mt-2 font-mukta text-[16px] text-[#2f2f2f]">
                {data.result} —{' '}
                {MEANINGS[data.calculatorType] ||
                  'This number reveals your personalized numerology insight.'}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleCalculateAgain}
              className="min-h-[52px] rounded-full bg-[#5D1409] px-6 py-3.5 font-mukta text-[17px] font-bold text-white hover:opacity-95"
            >
              Calculate Again
            </button>
            <Link
              href="/calculators"
              className="min-h-[52px] rounded-full border border-[#5D1409] bg-[#fff9ec] px-6 py-3.5 font-mukta text-[17px] font-bold text-[#5D1409] text-center hover:bg-[#f5e9d7]"
            >
              Back to Calculators
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-[#b8b0a8] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <Image
              src={NumerologyCalculatorImage}
              alt="Numerology result illustration"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 520px"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1440px]">
        <h2 className="font-sahitya font-bold text-[22px] md:text-[26px] leading-[1.1] text-primary">
          Other Calculators
        </h2>

        <div className="mt-5 flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8 md:overflow-visible md:pb-0">
          <CalculatorCard
            title="Love Calculator"
            description="Discover your compatibility with a partner or potential love interest."
            mobileHorizontal
            calculateHref="/calculators/love-calculator"
            icon={
              <Image
                src={LoveHeroImage}
                alt="Love calculator"
                width={84}
                height={84}
                className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />
          <CalculatorCard
            title="Numerology Calculator"
            description="Discover your life path number and explore numerology insights."
            mobileHorizontal
            calculateHref="/calculators/numerology-calculator"
            icon={
              <Image
                src={NumerologyCalculatorImage}
                alt="Numerology calculator"
                width={84}
                height={84}
                className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />
          <CalculatorCard
            title="Sun Sign Calculator"
            description="Discover your zodiac sign based on birth date and astrology insights."
            mobileHorizontal
            icon={
              <Image
                src={SunSignCalculatorImage}
                alt="Sun sign calculator"
                width={84}
                height={84}
                className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />
          <CalculatorCard
            title="Mangal Dosha Calculator"
            description="Check Mangal dosha and marriage effects in your birth chart."
            mobileHorizontal
            icon={
              <Image
                src={MangalDoshaImage}
                alt="Mangal dosha calculator"
                width={84}
                height={84}
                className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />
        </div>
      </div>
    </section>
  );
}
