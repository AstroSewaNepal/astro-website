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
    <section className="pt-6 md:pt-12">
      <div>
        <h1 className="font-sahitya font-bold text-[30px] md:text-[36px] lg:text-[44px] leading-[1.1] text-primary">
          Free Astrology Calculators
        </h1>
        <p className="mt-2 font-mukta text-[14px] md:text-[16px] lg:text-[18px] leading-[1.5] text-[#141414]">
          Find your moon sign, check Mangal Dosha, calculate your Dasha timeline, or explore numerology. All powered by real Vedic ephemeris data.
        </p>

        <p className="mt-4 font-mukta text-[14px] md:text-[16px] lg:text-[18px] leading-[1.7] text-Paragraph max-w-[1200px]">
          Explore your destiny with Astro Sewa&apos;s powerful Vedic and Western astrology tools.
          Instantly discover deeper insights about your personality, relationships, career, and life
          journey — all designed to guide you toward clarity and self-understanding.
        </p>

        <h2 className="mt-10 font-sahitya font-bold text-[22px] md:text-[26px] leading-[1.1] text-primary">
          Choose a Calculator
        </h2>

        <div className="mt-5 md:hidden flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          <CalculatorCard
            title="Love Calculator"
            description="Get a compatibility score based on Vedic Kuta matching. Enter names and birth details for both partners to see how your signs, Nakshatras, and planetary positions align."
            mobileHorizontal
            calculateHref="/calculators/love-calculator"
            icon={
              <Image
                src={LoveCalculatorIcon}
                alt="Love calculator"
                width={84}
                height={84}
                className="h-[130px] w-[128px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Numerology Calculator"
            description="Calculate your Life Path Number, Expression Number, and Soul Urge Number using Pythagorean numerology. All you need is your full name and date of birth."
            mobileHorizontal
            calculateHref="/calculators/numerology-calculator"
            icon={
              <Image
                src={NumerologyCalculatorImage}
                alt="Numerology calculator"
                width={84}
                height={84}
                className="h-[130px] w-[128px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Sun Sign Calculator"
            description="Find your true Vedic sun sign using the sidereal zodiac and Lahiri ayanamsa. This gives you your real Jyotish sun sign, not the simplified date range from Western horoscopes."
            mobileHorizontal
            calculateHref="/calculators/sun-sign-calculator"
            icon={
              <Image
                src={SunSignCalculatorImage}
                alt="Sun sign calculator"
                width={84}
                height={84}
                className="h-[130px] w-[128px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Mangal Dosha Calculator"
            description="Check whether Mars creates Mangal Dosha in your birth chart. Chart-based analysis using real planetary positions, not a simplified birth date rule."
            mobileHorizontal
            calculateHref="/calculators/mangal-dosha-calculator"
            icon={
              <Image
                src={MangalDoshaImage}
                alt="Mangal dosha calculator"
                width={84}
                height={84}
                className="h-[130px] w-[128px] md:h-[84px] md:w-[84px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Dasha Calculator"
            titleClassName="md:text-[22px] md:leading-[32px] text-center"
            descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
            description="Find your current Mahadasha and Antardasha using the Vimshottari system. See which planet is shaping this phase of your life and what the timeline ahead looks like."
            mobileHorizontal
            calculateHref="/calculators/dasha-calculator"
            icon={
              <Image
                src={DashaImage}
                alt="Dasha calculator"
                width={130}
                height={130}
                className="h-[130px] w-[128px] object-contain opacity-100"
              />
            }
          />

          <CalculatorCard
            title="Moon Phase Calculator"
            titleClassName="md:text-[22px] md:leading-[32px] text-center"
            descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
            description="See the exact lunar phase and Tithi at the time of your birth. Calculated using VedAstro Panchanga and real ephemeris data, not a calendar formula."
            mobileHorizontal
            calculateHref="/calculators/moon-phase-calculator"
            icon={
              <Image
                src={MoonPhaseImage}
                alt="Moon phase calculator"
                width={130}
                height={130}
                className="h-[130px] w-[128px] object-contain opacity-100"
              />
            }
          />

          <CalculatorCard
            title="Rashi Calculator"
            titleClassName="md:text-[22px] md:leading-[32px] text-center"
            descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
            description="Find your Vedic moon sign (Rashi) calculated from your exact birth time and location. Your Rashi is the foundation for Dasha calculations and Kundali matching."
            mobileHorizontal
            calculateHref="/calculators/rashi-calculator"
            icon={
              <Image
                src={RashiCalculatorImage}
                alt="Rashi calculator"
                width={130}
                height={130}
                className="h-[130px] w-[128px] object-contain opacity-100"
              />
            }
          />
        </div>

        <div className="mt-5 hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          <CalculatorCard
            title="Love Calculator"
            titleClassName="md:text-[20px] md:leading-[28px] text-center"
            descriptionClassName="text-[13px] md:text-[14px] md:leading-[24px] text-center font-normal md:max-w-none"
            description="Get a compatibility score based on Vedic Kuta matching. Enter names and birth details for both partners to see how your signs, Nakshatras, and planetary positions align."
            mobileHorizontal
            calculateHref="/calculators/love-calculator"
            icon={
              <Image
                src={LoveCalculatorIcon}
                alt="Love calculator"
                width={100}
                height={100}
                className="h-[100px] w-[100px] md:h-[100px] md:w-[100px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Numerology Calculator"
            titleClassName="md:text-[20px] md:leading-[28px] text-center"
            descriptionClassName="text-[13px] md:text-[14px] md:leading-[24px] text-center font-normal md:max-w-none"
            description="Calculate your Life Path Number, Expression Number, and Soul Urge Number using Pythagorean numerology. All you need is your full name and date of birth."
            mobileHorizontal
            calculateHref="/calculators/numerology-calculator"
            icon={
              <Image
                src={NumerologyCalculatorImage}
                alt="Numerology calculator"
                width={100}
                height={100}
                className="h-[100px] w-[100px] md:h-[100px] md:w-[100px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Sun Sign Calculator"
            titleClassName="md:text-[20px] md:leading-[28px] text-center"
            descriptionClassName="text-[13px] md:text-[14px] md:leading-[24px] text-center font-normal md:max-w-none"
            description="Find your true Vedic sun sign using the sidereal zodiac and Lahiri ayanamsa. This gives you your real Jyotish sun sign, not the simplified date range from Western horoscopes."
            mobileHorizontal
            calculateHref="/calculators/sun-sign-calculator"
            icon={
              <Image
                src={SunSignCalculatorImage}
                alt="Sun sign calculator"
                width={100}
                height={100}
                className="h-[100px] w-[100px] md:h-[100px] md:w-[100px] object-contain"
              />
            }
          />

          <CalculatorCard
            title="Mangal Dosha Calculator"
            titleClassName="md:text-[20px] md:leading-[28px] text-center whitespace-nowrap"
            descriptionClassName="text-[13px] md:text-[14px] md:leading-[24px] text-center font-normal md:max-w-none"
            description="Check whether Mars creates Mangal Dosha in your birth chart. Chart-based analysis using real planetary positions, not a simplified birth date rule."
            mobileHorizontal
            calculateHref="/calculators/mangal-dosha-calculator"
            icon={
              <Image
                src={MangalDoshaImage}
                alt="Mangal dosha calculator"
                width={100}
                height={100}
                className="h-[100px] w-[100px] md:h-[100px] md:w-[100px] object-contain"
              />
            }
          />
        </div>

        <div className="mt-5 hidden md:grid md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <CalculatorCard
            title="Dasha Calculator"
            titleClassName="md:text-[22px] md:leading-[32px] text-center"
            descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
            description="Find your current Mahadasha and Antardasha using the Vimshottari system. See which planet is shaping this phase of your life and what the timeline ahead looks like."
            calculateHref="/calculators/dasha-calculator"
            icon={
              <Image
                src={DashaImage}
                alt="Dasha calculator"
                width={120}
                height={120}
                className="h-[120px] w-[120px] object-contain opacity-100"
              />
            }
          />

          <CalculatorCard
            title="Moon Phase Calculator"
            titleClassName="md:text-[22px] md:leading-[32px] text-center"
            descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
            description="See the exact lunar phase and Tithi at the time of your birth. Calculated using VedAstro Panchanga and real ephemeris data, not a calendar formula."
            calculateHref="/calculators/moon-phase-calculator"
            icon={
              <Image
                src={MoonPhaseImage}
                alt="Moon phase calculator"
                width={120}
                height={120}
                className="h-[120px] w-[120px] object-contain opacity-100"
              />
            }
          />

          <CalculatorCard
            title="Rashi Calculator"
            titleClassName="md:text-[22px] md:leading-[32px] text-center"
            descriptionClassName="md:text-[18px] md:leading-[28px] text-center font-normal md:max-w-none"
            description="Find your Vedic moon sign (Rashi) calculated from your exact birth time and location. Your Rashi is the foundation for Dasha calculations and Kundali matching."
            calculateHref="/calculators/rashi-calculator"
            icon={
              <Image
                src={RashiCalculatorImage}
                alt="Rashi calculator"
                width={120}
                height={120}
                className="h-[120px] w-[120px] object-contain opacity-100"
              />
            }
          />
        </div>

        <div className="mt-14 mb-14">
          <h2 className="font-sahitya font-bold text-[26px] md:text-[30px] leading-[1.05] text-primary">
            How They Work
          </h2>
          <p className="mt-4 font-mukta text-[16px] md:text-[18px] lg:text-[20px] leading-[1.7] text-[#000000CF] max-w-[1400px]">
            Powered by Real Vedic Data
          </p>
          <p className="mt-5 font-mukta text-[16px] md:text-[18px] lg:text-[20px] leading-[1.8] text-[#000000CF] max-w-[1400px]">
            Every calculator on this page uses VedAstro, a real ephemeris engine that computes planetary positions from your exact birth time, date, and location. This is not a date-range lookup table. The results reflect where the planets actually were when you were born.
          </p>
          <p className="mt-5 font-mukta text-[16px] md:text-[18px] lg:text-[20px] leading-[1.8] text-[#000000CF] max-w-[1400px]">
            For the best accuracy, enter your exact birth time. If you do not know it, most calculators will still return a result and will tell you the confidence level. For readings where timing matters most, like Dasha periods or Mangal Dosha, a full chart consultation with one of our astrologers will give you the most complete picture.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Calculators;
