import React from 'react';
import Image from 'next/image';

import CalculatorCard from './calculator-card';
import LoveCalculatorIcon from '@/components/images/icons/loveicon.png';
import NumerologyCalculatorImage from '@/components/images/calculator/numerologycalculator.png';
import SunSignCalculatorImage from '@/components/images/calculator/sunsigncalculator.png';
import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';
import DashaImage from '@/components/images/calculator/dasha.png';
import MoonPhaseImage from '@/components/images/calculator/moonphase.png';
import RashiCalculatorImage from '@/components/images/calculator/rashicalculator.png';

const Calculators: React.FC = () => {
  return (
    <section className="w-full px-3 md:px-8">
      <div className="max-w-[1454px] mx-auto">
        <h1 className="font-sahitya font-bold text-[30px] md:text-[36px] lg:text-[44px]  leading-[1.1] text-primary">
          Astrology Calculators
        </h1>
        <p className="mt-2 font-mukta text-[14px] md:text-[16px] lg:text-[18px] leading-[1.5] text-[#141414]">
          Life is like a calculator, you don’t even know how much your partner loves you. 😅
        </p>

        <p className="mt-6 font-mukta text-[14px] md:text-[16px] lg:text-[18px] leading-[1.7] text-Paragraph max-w-[1200px]">
          Explore your destiny with Astro Sewa&apos;s powerful Vedic and Western astrology tools.
          Instantly discover deeper insights about your personality, relationships, career, and life
          journey — all designed to guide you toward clarity and self-understanding.
        </p>

        <h2 className="mt-10 font-sahitya font-bold text-[22px] md:text-[26px] leading-[1.1] text-primary">
          Choose Your Calculator
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

          <div className="md:hidden">
            <CalculatorCard
              title="Dasha Calculator"
              description="Calculate planetary dasha periods and analyze timing of life events in Vedic astrology."
              mobileHorizontal
              calculateHref="/calculators/dasha-calculator"
              icon={
                <Image
                  src={DashaImage}
                  alt="Dasha calculator"
                  width={130}
                  height={130}
                  className="h-[130.0032px] w-[128.2434px] object-contain opacity-100"
                />
              }
            />
          </div>

          <div className="md:hidden">
            <CalculatorCard
              title="Moon Phase Calculator"
              description="Track and explore current moon phases and lunar cycle changes over time."
              mobileHorizontal
              calculateHref="/calculators/moon-phase-calculator"
              icon={
                <Image
                  src={MoonPhaseImage}
                  alt="Moon phase calculator"
                  width={130}
                  height={130}
                  className="h-[130.0032px] w-[128.2434px] object-contain opacity-100"
                />
              }
            />
          </div>

          <div className="md:hidden">
            <CalculatorCard
              title="Rashi Calculator"
              description="Discover your moon sign and understand your Vedic astrology birth chart insights."
              mobileHorizontal
              calculateHref="/calculators/rashi-calculator"
              icon={
                <Image
                  src={RashiCalculatorImage}
                  alt="Rashi calculator"
                  width={130}
                  height={130}
                  className="h-[130.0032px] w-[128.2434px] object-contain opacity-100"
                />
              }
            />
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="mt-6 hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
        <CalculatorCard
          title="Dasha Calculator"
          titleClassName="md:text-[22px] md:leading-[32px] text-center"
          descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
          description="Calculate planetary dasha periods and analyze timing of life events in Vedic astrology."
          calculateHref="/calculators/dasha-calculator"
          icon={
            <Image
              src={DashaImage}
              alt="Dasha calculator"
              width={130}
              height={130}
              className="h-[130.0032px] w-[128.2434px] md:h-[130.0032px] md:w-[128.2434px] object-contain opacity-100"
            />
          }
        />

        <CalculatorCard
          title="Moon Phase Calculator"
          titleClassName="md:text-[22px] md:leading-[32px] text-center"
          descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
          description="Track and explore current moon phases and lunar cycle changes over time."
          calculateHref="/calculators/moon-phase-calculator"
          icon={
            <Image
              src={MoonPhaseImage}
              alt="Moon phase calculator"
              width={130}
              height={130}
              className="h-[130.0032px] w-[128.2434px] md:h-[130.0032px] md:w-[128.2434px] object-contain opacity-100"
            />
          }
        />

        <CalculatorCard
          title="Rashi Calculator"
          titleClassName="md:text-[22px] md:leading-[32px] text-center"
          descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
          description="Discover your moon sign and understand your Vedic astrology birth chart insights."
          calculateHref="/calculators/rashi-calculator"
          icon={
            <Image
              src={RashiCalculatorImage}
              alt="Rashi calculator"
              width={130}
              height={130}
              className="h-[130.0032px] w-[128.2434px] md:h-[130.0032px] md:w-[128.2434px] object-contain opacity-100"
            />
          }
        />
      </div>
    </section>
  );
};

export default Calculators;
