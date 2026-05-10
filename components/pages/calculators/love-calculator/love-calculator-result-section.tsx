'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoShareOutline } from 'react-icons/io5';
import { FiRefreshCcw } from 'react-icons/fi';

import UploadPhotoImg from '@/components/images/uploadyourphoto.png';
import LoveMatchIcon from '@/components/images/icons/lovematch.png';
import CalculatorCard from '@/components/pages/calculators/calculator-card';
import LoveHeroImage from '@/components/images/lovecalculator.png';
import NumerologyCalculatorImage from '@/components/images/calculator/numerologycalculator.png';
import SunSignCalculatorImage from '@/components/images/calculator/sunsigncalculator.png';
import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';

type LoveResult = {
  yourName: string;
  partnerName: string;
  score: number;
};

export default function LoveCalculatorResultSection() {
  const router = useRouter();
  const [result, setResult] = useState<LoveResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('loveCalculatorResult');
    if (raw) {
      try {
        setResult(JSON.parse(raw));
      } catch {
        setResult(null);
      }
    }
  }, []);

  const handleCalculateAnother = () => {
    sessionStorage.removeItem('loveCalculatorResult');
    router.push('/calculators/love-calculator');
  };

  if (!result) {
    return (
      <section className="w-full px-4 md:px-8 py-24 flex flex-col items-center justify-center">
        <h2 className="font-sahitya text-3xl font-bold text-[#5D1409]">No Data Found</h2>
        <p className="font-mukta mt-2 text-[#4a4a4a]">
          Please enter your names in the Love Calculator first.
        </p>
        <Link
          href="/calculators/love-calculator"
          className="mt-6 flex min-h-[48px] items-center justify-center rounded-full bg-[#5D1409] px-8 font-mukta text-lg font-bold text-white transition-opacity hover:opacity-95"
        >
          Go to Love Calculator
        </Link>
      </section>
    );
  }

  return (
    <section className="w-full px-3 md:px-8 pb-12">
      <div className="mx-auto max-w-[1454px]">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-sahitya text-[28px] md:text-[36px] font-bold leading-tight text-[#471207] italic">
            Lovers Report
          </h1>
          <p className="font-mukta text-[#4a4a4a] text-[13px] md:text-[15px] mt-0.5">
            This calculation may or may not be true but you can analyze it.
          </p>
        </div>

        {/* Result Card */}
        <div className="rounded-[16px] border border-[#d4c4b8] p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8">
          {/* Photo */}
          <div
            className="shrink-0 relative rounded-[12px] overflow-hidden"
            style={{ width: 200, height: 210 }}
          >
            <Image src={UploadPhotoImg} alt="Couple photo" fill className="object-cover" priority />
          </div>

          {/* Names + Heart */}
          <div className="flex flex-col items-center justify-center shrink-0 gap-1 py-2">
            <h2 className="font-sahitya font-bold text-[22px] md:text-[26px] uppercase text-[#471207] text-center tracking-wide leading-none">
              {result.yourName}
            </h2>

            <div
              className="relative flex items-center justify-center"
              style={{ width: 130, height: 120 }}
            >
              <Image src={LoveMatchIcon} alt="Heart" fill className="object-contain" />
              <div className="relative z-10 flex flex-col items-center">
                <span className="font-sahitya font-normal text-white text-[40px] leading-[38px] tracking-normal text-center drop-shadow-md">
                  {result.score}%
                </span>
                <span className="font-mukta font-normal text-white text-[16px] leading-[20px] tracking-normal text-center">
                  Matched
                </span>
              </div>
            </div>

            <h2 className="font-sahitya font-bold text-[22px] md:text-[26px] uppercase text-[#471207] text-center tracking-wide leading-none">
              {result.partnerName}
            </h2>
          </div>

          {/* Narrative + Buttons */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4">
            <p className="font-mukta text-[#2d2d2d] text-[14px] md:text-[16px] leading-[1.7] max-w-[420px]">
              Like a love meteorite, your connection will leave a profound impact on the world,
              inspiring others to seek their own cosmic love.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: 'Love Calculator Match',
                        text: `Check out our love match! ${result.yourName} & ${result.partnerName} scored ${result.score}%!`,
                        url: window.location.href,
                      })
                      .catch(console.error);
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-full bg-[#471207] px-5 py-2.5 font-mukta text-[14px] font-semibold text-white transition-colors hover:bg-[#5D1409]"
              >
                <IoShareOutline className="text-lg" />
                Share your match
              </button>

              <button
                onClick={handleCalculateAnother}
                className="flex items-center justify-center gap-2 rounded-full border border-[#471207] bg-transparent px-5 py-2.5 font-mukta text-[14px] font-semibold text-[#471207] transition-colors hover:bg-[#471207] hover:text-white"
              >
                <FiRefreshCcw className="text-base" />
                Calculate Another
              </button>
            </div>
          </div>
        </div>

        {/* Other Calculators */}
        <div className="mt-10">
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
      </div>
    </section>
  );
}
