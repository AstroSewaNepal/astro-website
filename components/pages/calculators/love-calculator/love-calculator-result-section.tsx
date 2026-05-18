'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoShareOutline } from 'react-icons/io5';
import { FiRefreshCcw } from 'react-icons/fi';

import UploadPhotoImg from '@/components/images/uploadyourphoto.png';
import LoveMatchIcon from '@/components/images/icons/lovematch.png';
import LoveCalculatorIcon from '@/components/images/icons/loveicon.png';
import CalculatorCard from '@/components/pages/calculators/calculator-card';
import LoveHeroImage from '@/components/images/lovecalculator.png';
import NumerologyCalculatorImage from '@/components/images/calculator/numerologycalculator.png';
import SunSignCalculatorImage from '@/components/images/calculator/sunsigncalculator.png';
import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';
import DashaImage from '@/components/images/calculator/dasha.png';
import MoonPhaseImage from '@/components/images/calculator/moonphase.png';
import RashiCalculatorImage from '@/components/images/calculator/rashicalculator.png';

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
      let cancelled = false;
      try {
        const parsed = JSON.parse(raw) as LoveResult;
        queueMicrotask(() => {
          if (!cancelled) setResult(parsed);
        });
      } catch {
        queueMicrotask(() => {
          if (!cancelled) setResult(null);
        });
      }
      return () => {
        cancelled = true;
      };
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
          <h1 className="font-sahitya font-bold text-[22px] md:text-[48px] leading-[32px] md:leading-[48px] tracking-[0%] text-[#471207]">
            Lovers Report
          </h1>
          <p className="font-mukta font-medium text-[14px] md:text-[24px] leading-[30px] tracking-[0%] text-[#4a4a4a] mt-0.5">
            This calculation may or may not be true but you can analyze it.
          </p>
        </div>

        {/* Result Card */}
        <div className="rounded-[16px] border border-[#d4c4b8] p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8">
          {/* Photo */}
          <div className="shrink-0 relative rounded-[19px] overflow-hidden w-full max-w-[320px] h-[332px] md:w-[318px] md:h-[333px]">
            <Image src={UploadPhotoImg} alt="Couple photo" className="w-full h-full object-cover" width={318} height={333} priority />
          </div>

          {/* Names + Heart */}
          {/* Mobile: names left/right with heart centered */}
          <div className="w-full md:hidden flex items-center justify-between px-0">
            <div className="w-[20%] text-left">
              <h3 className="font-mukta font-semibold text-[20px] leading-[38px] uppercase text-[#471207]">
                {result.yourName}
              </h3>
            </div>

            <div className="flex-shrink-0 mx-0 relative flex items-center justify-center w-[60%]">
              <div className="relative flex items-center justify-center w-[87.11408996582031px] h-[79.92717742919922px]">
              <Image
                src={LoveMatchIcon}
                alt="Heart"
                width={205}
                height={188}
                className="object-contain w-[87.11408996582031px] h-[79.92717742919922px]"
              />
              </div>
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-sahitya font-normal text-white text-[18px] leading-none tracking-[0%] text-center drop-shadow-md">
                  {result.score}%
                </span>
                <span className="font-mukta font-normal text-white text-[10px] leading-none tracking-[0%] text-center">
                  Matched
                </span>
              </div>
            </div>

            <div className="w-[20%] text-right">
              <h3 className="font-mukta font-semibold text-[20px] leading-[38px] uppercase text-[#471207]">
                {result.partnerName}
              </h3>
            </div>
          </div>

          {/* Desktop / tablet: stacked names with heart between */}
          <div className="hidden md:flex flex-col items-center justify-center shrink-0 gap-4 -ml-0 md:-ml-8 self-center md:self-auto w-full md:w-[426px]">
            <h2 className="font-mukta font-semibold text-[20px] md:text-[36px] uppercase text-[#471207] text-center tracking-[0%] leading-[38px] md:leading-[38px]">
              {result.yourName}
            </h2>

            <div className="relative flex items-center justify-center w-[205px] h-[188px]">
              <Image
                src={LoveMatchIcon}
                alt="Heart"
                width={205}
                height={188}
                className="object-contain w-[205px] h-[188px]"
              />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-sahitya font-normal text-white text-[64px] leading-none tracking-[0%] text-center drop-shadow-md">
                  {result.score}%
                </span>
                <span className="font-mukta font-normal text-white text-[24px] leading-none tracking-[0%] text-center">
                  Matched
                </span>
              </div>
            </div>

            <h2 className="font-mukta font-semibold text-[20px] md:text-[36px] uppercase text-[#471207] text-center tracking-[0%] leading-[38px] md:leading-[38px]">
              {result.partnerName}
            </h2>
          </div>

          {/* Narrative + Buttons */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-6 md:pt-20 ml-0 md:-ml-12">
            <p className="font-mukta font-normal text-[#2d2d2d] text-[16px] md:text-[24px] leading-[30px] md:leading-[34px] tracking-[0%] max-w-full text-justify px-2 md:px-0">
              Like a love meteorite, your connection will leave a profound impact on the world,
              inspiring others to seek their own cosmic love.
            </p>

            <div className="flex w-full flex-col sm:flex-row items-center gap-3 mt-5 px-2 sm:px-0">
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
                className="flex items-center justify-center gap-[10px] rounded-[40px] w-full sm:w-[204px] h-[50px] p-[12px] bg-[#471207] font-mukta font-semibold text-[18px] leading-[30px] tracking-[0%] text-white transition-colors hover:bg-[#5D1409]"
              >
                <IoShareOutline className="text-lg" />
                Share your match
              </button>

              <button
                onClick={handleCalculateAnother}
                className="flex items-center justify-center gap-[10px] rounded-[32px] border-[2px] border-[#471207] bg-transparent px-[24px] py-[12px] w-full sm:w-[240px] h-[50px] font-mukta font-semibold text-[18px] leading-[30px] tracking-[0%] text-[#471207] transition-colors hover:bg-[#471207] hover:text-white"
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
                  src={LoveCalculatorIcon}
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
              calculateHref="/calculators/sun-sign-calculator"
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
              calculateHref="/calculators/mangal-dosha-calculator"
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
            <CalculatorCard
              title="Dasha Calculator"
              description="Calculate planetary dasha periods and analyze timing of life events in Vedic astrology."
              mobileHorizontal
              calculateHref="/calculators/dasha-calculator"
              icon={
                <Image
                  src={DashaImage}
                  alt="Dasha calculator"
                  width={84}
                  height={84}
                  className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
                />
              }
            />
            <CalculatorCard
              title="Moon Phase Calculator"
              description="Track and explore current moon phases and lunar cycle changes over time."
              mobileHorizontal
              calculateHref="/calculators/moon-phase-calculator"
              icon={
                <Image
                  src={MoonPhaseImage}
                  alt="Moon phase calculator"
                  width={84}
                  height={84}
                  className="h-[96px] w-[96px] md:h-[84px] md:w-[84px] object-contain"
                />
              }
            />
            <CalculatorCard
              title="Rashi Calculator"
              description="Discover your moon sign and understand your Vedic astrology birth chart insights."
              mobileHorizontal
              calculateHref="/calculators/rashi-calculator"
              icon={
                <Image
                  src={RashiCalculatorImage}
                  alt="Rashi calculator"
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
