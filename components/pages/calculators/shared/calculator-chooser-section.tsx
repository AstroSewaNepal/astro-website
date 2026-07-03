import type { ReactNode } from 'react';
import Image from 'next/image';

import CalculatorCard from '@/components/pages/calculators/calculator-card';
import DashaImage from '@/components/images/calculator/dasha.png';
import LoveCalculatorIcon from '@/components/images/icons/loveicon.png';
import MangalDoshaImage from '@/components/images/calculator/mangaldosha.png';
import MoonPhaseImage from '@/components/images/calculator/moonphase.png';
import NumerologyCalculatorImage from '@/components/images/calculator/numerologycalculator.png';
import RashiCalculatorImage from '@/components/images/calculator/rashicalculator.png';
import SunSignCalculatorImage from '@/components/images/calculator/sunsigncalculator.png';

type CalculatorChooserSectionProps = {
  exclude?: string;
};

const calculators: Array<{
  key: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}> = [
  {
    key: 'love',
    title: 'Love Calculator',
    description:
      'Get a compatibility score based on Vedic Kuta matching. Enter names and birth details for both partners to see how your signs, Nakshatras, and planetary positions align.',
    href: '/calculators/love-calculator',
    icon: (
      <Image
        src={LoveCalculatorIcon}
        alt="Love calculator"
        width={120}
        height={120}
        className="h-[120px] w-[120px] md:h-[120px] md:w-[120px] object-contain"
      />
    ),
  },
  {
    key: 'numerology',
    title: 'Numerology Calculator',
    description:
      'Calculate your Life Path Number, Expression Number, and Soul Urge Number using Pythagorean numerology. All you need is your full name and date of birth.',
    href: '/calculators/numerology-calculator',
    icon: (
      <Image
        src={NumerologyCalculatorImage}
        alt="Numerology calculator"
        width={120}
        height={120}
        className="h-[120px] w-[120px] md:h-[120px] md:w-[120px] object-contain"
      />
    ),
  },
  {
    key: 'sun-sign',
    title: 'Sun Sign Calculator',
    description:
      'Find your true Vedic sun sign using the sidereal zodiac and Lahiri ayanamsa. This gives you your real Jyotish sun sign, not the simplified date range from Western horoscopes.',
    href: '/calculators/sun-sign-calculator',
    icon: (
      <Image
        src={SunSignCalculatorImage}
        alt="Sun sign calculator"
        width={120}
        height={120}
        className="h-[120px] w-[120px] md:h-[120px] md:w-[120px] object-contain"
      />
    ),
  },
  {
    key: 'mangal-dosha',
    title: 'Mangal Dosha Calculator',
    description:
      'Check whether Mars creates Mangal Dosha in your birth chart. Chart-based analysis using real planetary positions, not a simplified birth date rule.',
    href: '/calculators/mangal-dosha-calculator',
    icon: (
      <Image
        src={MangalDoshaImage}
        alt="Mangal dosha calculator"
        width={120}
        height={120}
        className="h-[120px] w-[120px] md:h-[120px] md:w-[120px] object-contain"
      />
    ),
  },
  {
    key: 'dasha',
    title: 'Dasha Calculator',
    description:
      'Find your current Mahadasha and Antardasha using the Vimshottari system. See which planet is shaping this phase of your life and what the timeline ahead looks like.',
    href: '/calculators/dasha-calculator',
    icon: (
      <Image
        src={DashaImage}
        alt="Dasha calculator"
        width={120}
        height={120}
        className="h-[120px] w-[120px] object-contain opacity-100"
      />
    ),
  },
  {
    key: 'moon-phase',
    title: 'Moon Phase Calculator',
    description:
      'See the exact lunar phase and Tithi at the time of your birth. Calculated using VedAstro Panchanga and real ephemeris data, not a calendar formula.',
    href: '/calculators/moon-phase-calculator',
    icon: (
      <Image
        src={MoonPhaseImage}
        alt="Moon phase calculator"
        width={120}
        height={120}
        className="h-[120px] w-[120px] object-contain opacity-100"
      />
    ),
  },
  {
    key: 'rashi',
    title: 'Rashi Calculator',
    description:
      'Find your Vedic moon sign (Rashi) calculated from your exact birth time and location. Your Rashi is the foundation for Dasha calculations and Kundali matching.',
    href: '/calculators/rashi-calculator',
    icon: (
      <Image
        src={RashiCalculatorImage}
        alt="Rashi calculator"
        width={120}
        height={120}
        className="h-[120px] w-[120px] object-contain opacity-100"
      />
    ),
  },
];

export default function CalculatorChooserSection({ exclude }: CalculatorChooserSectionProps) {
  return (
    <div className="mt-12">
      <h2 className="font-sahitya font-bold text-[22px] md:text-[26px] leading-[1.1] text-primary">
        Explore more calculators
      </h2>

      <div className="mt-5 flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8 md:overflow-visible md:pb-0">
        {calculators
          .filter(calculator => calculator.key !== exclude)
          .map(calculator => (
            <CalculatorCard
              key={calculator.key}
              title={calculator.title}
              description={calculator.description}
              calculateHref={calculator.href}
              mobileHorizontal
              icon={calculator.icon}
            />
          ))}
      </div>
    </div>
  );
}
