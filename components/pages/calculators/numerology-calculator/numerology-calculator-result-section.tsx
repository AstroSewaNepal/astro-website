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

type NumerologyResult = {
  fullName: string;
  birthDate: string;
  calculatorType: string;
  result: number;
  resultLabel: string;
  radixNumber?: number;
  namankNumber?: number;
  luckyNumbers?: string;
  favouriteSign?: string;
  favouriteAlphabet?: string;
  gemstone?: string;
  favourableDay?: string;
  favourableNumber?: string;
  friendSign?: string;
  auspiciousColour?: string;
  rulingPlanet?: string;
  godGoddess?: string;
  fast?: string;
  favourableNakshatra?: string;
  mantra?: string;
};

const ANALYSIS_ROWS = [
  { key: 'radixNumber', label: 'Radix Number' },
  { key: 'namankNumber', label: 'Namank Number' },
  { key: 'luckyNumbers', label: 'Lucky Numbers...' },
  { key: 'favouriteSign', label: 'Favourite Sign' },
  { key: 'favouriteAlphabet', label: 'Favourite Alphabet' },
  { key: 'gemstone', label: 'Gemstone' },
  { key: 'favourableDay', label: 'Favourable Day' },
  { key: 'favourableNumber', label: 'Favourable Number' },
  { key: 'friendSign', label: 'Friend Sign' },
  { key: 'auspiciousColour', label: 'Auspicious Colour' },
  { key: 'rulingPlanet', label: 'Ruling Planet' },
  { key: 'godGoddess', label: 'God Goddess' },
  { key: 'fast', label: 'Fast' },
  { key: 'favourableNakshatra', label: 'Favourable Nakshatra' },
  { key: 'mantra', label: 'Mantra' },
];

// Fallback demo data matching the Figma screenshot
const DEMO_DATA: NumerologyResult = {
  fullName: 'Sophia',
  birthDate: '07/07/2001',
  calculatorType: 'life-path',
  result: 4,
  resultLabel: 'Life Path Number',
  radixNumber: 4,
  namankNumber: 8,
  luckyNumbers: '—',
  favouriteSign: 'Pisces',
  favouriteAlphabet: 'G, EY',
  gemstone: "Cat's Eye",
  favourableDay: 'Monday, Thursday',
  favourableNumber: '2, 5, 7',
  friendSign: 'Virgo',
  auspiciousColour: 'Grey, Violet',
  rulingPlanet: 'Neptune (Ketu)',
  godGoddess: 'Lord Shiva',
  fast: 'Monday Fast',
  favourableNakshatra: 'P,M,SS',
  mantra: 'ik oo Shpya',
};

export default function NumerologyCalculatorResultSection() {
  const router = useRouter();
  const [data] = useState<NumerologyResult | null>(() => {
    if (typeof window === 'undefined') return DEMO_DATA;
    const raw = sessionStorage.getItem('numerologyCalculatorResult');
    if (!raw) return DEMO_DATA;
    try {
      return { ...DEMO_DATA, ...JSON.parse(raw) };
    } catch {
      return DEMO_DATA;
    }
  });

  const handleCalculateAgain = () => {
    router.push('/calculators/numerology-calculator');
  };

  if (!data) {
    return (
      <section className="w-full px-3 md:px-8 pb-12">
        <div className="mx-auto max-w-[1440px] rounded-[24px] border border-[#d3c2b4] bg-white/90 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <h1 className="font-sahitya text-[32px] font-bold text-[#5D1409] md:text-[40px]">
            Numerology Result
          </h1>
          <p className="mt-4 font-mukta text-[16px] text-[#2f2f2f]">
            No result found. Please go back and calculate your numerology profile first.
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
    <section className="w-full px-3 md:px-8 pb-16" >
      <div className="mx-auto max-w-[900px]">

        {/* ── Page Title ── */}
        <div className="pt-8 pb-4">
          <h1 className="font-sahitya text-[28px] font-bold text-[#5D1409] md:text-[34px]">
            Numerology Calculator
          </h1>
          <p className="mt-2 font-mukta text-[15px] text-[#6d6d6d] leading-relaxed max-w-[700px]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
            ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>

        {/* ── Main Card ── */}
        <div
          className="rounded-[20px] border border-[#d3c2b4]  overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
        >
          {/* Personal Information */}
          <div className="px-6 pt-6 pb-4 border-b border-[#e8ddd4]">
            <h2 className="font-sahitya text-[18px] font-bold text-[#5D1409] mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {/* Name row */}
              <div className="py-3 border-b border-[#ede5dc]">
                <p className="font-mukta text-[13px] text-[#9a8f87] uppercase tracking-wide">Name</p>
                <p className="font-mukta text-[15px] text-[#2f2f2f] mt-0.5">{data.fullName}</p>
              </div>
              {/* DOB row */}
              <div className="py-3 border-b border-[#ede5dc] sm:pl-8">
                <p className="font-mukta text-[13px] text-[#9a8f87] uppercase tracking-wide">Date of Birth</p>
                <p className="font-mukta text-[15px] text-[#2f2f2f] mt-0.5">{data.birthDate}</p>
              </div>
            </div>
          </div>

          {/* Numerology Analysis */}
          <div className="px-6 pt-5 pb-6">
            <h2 className="font-sahitya text-[18px] font-bold text-[#5D1409] mb-4">
              Numerology Analysis
            </h2>

            <div className="rounded-[12px] border border-[#e0d6cc] overflow-hidden">
              {ANALYSIS_ROWS.map((row, idx) => {
                const value = (data as Record<string, unknown>)[row.key];
                const displayValue =
                  value !== undefined && value !== null && value !== ''
                    ? String(value)
                    : '—';

                return (
                  <div
                    key={row.key}
                    className={`flex items-center justify-between px-4 py-3 
                       ${idx < ANALYSIS_ROWS.length - 1 ? 'border-b border-[#ede5dc]' : ''}`}
                  >
                    <span className="font-mukta text-[14px] text-[#5d5047] min-w-[180px]">
                      {row.label}
                    </span>
                    <span className="font-mukta text-[14px] text-[#2f2f2f] text-right">
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-7 flex flex-col sm:flex-row gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-[#5D1409] px-7 py-3 font-mukta text-[15px] font-bold text-white hover:opacity-95 transition-opacity"
            >
              {/* share icon */}
              Share Your Report
            </button>

            <button
              onClick={handleCalculateAgain}
              className="inline-flex items-center justify-center min-h-[48px] rounded-full border border-[#5D1409] bg-white px-7 py-3 font-mukta text-[15px] font-bold text-[#5D1409] hover:bg-[#5D1409]/5 transition-colors"
            >
              Calculate Again
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}