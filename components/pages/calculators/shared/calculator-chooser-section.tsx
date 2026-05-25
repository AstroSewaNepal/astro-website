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
    description: 'Discover your compatibility with a partner or potential love interest.',
    href: '/calculators/love-calculator',
    icon: (
      <Image
        src={LoveCalculatorIcon}
        alt="Love calculator"
        width={84}
        height={84}
        className="h-[130px] w-[128px] md:h-[84px] md:w-[84px] object-contain"
      />
    ),
  },
  {
    key: 'numerology',
    title: 'Numerology Calculator',
    description: 'Discover your life path number and explore numerology insights.',
    href: '/calculators/numerology-calculator',
    icon: (
      <Image
        src={NumerologyCalculatorImage}
        alt="Numerology calculator"
        width={84}
        height={84}
        className="h-[130px] w-[128px] md:h-[84px] md:w-[84px] object-contain"
      />
    ),
  },
  {
    key: 'sun-sign',
    title: 'Sun Sign Calculator',
    description: 'Discover your zodiac sign based on birth date and astrology insights.',
    href: '/calculators/sun-sign-calculator',
    icon: (
      <Image
        src={SunSignCalculatorImage}
        alt="Sun sign calculator"
        width={84}
        height={84}
        className="h-[130px] w-[128px] md:h-[84px] md:w-[84px] object-contain"
      />
    ),
  },
  {
    key: 'mangal-dosha',
    title: 'Mangal Dosha Calculator',
    description: 'Check Mangal dosha and marriage effects in your birth chart.',
    href: '/calculators/mangal-dosha-calculator',
    icon: (
      <Image
        src={MangalDoshaImage}
        alt="Mangal dosha calculator"
        width={84}
        height={84}
        className="h-[130px] w-[128px] md:h-[84px] md:w-[84px] object-contain"
      />
    ),
  },
  {
    key: 'dasha',
    title: 'Dasha Calculator',
    description: 'Calculate planetary dasha periods and analyze timing of life events in Vedic astrology.',
    href: '/calculators/dasha-calculator',
    icon: (
      <Image
        src={DashaImage}
        alt="Dasha calculator"
        width={130}
        height={130}
        className="h-[130px] w-[128px] object-contain opacity-100"
      />
    ),
  },
  {
    key: 'moon-phase',
    title: 'Moon Phase Calculator',
    description: 'Track and explore current moon phases and lunar cycle changes over time.',
    href: '/calculators/moon-phase-calculator',
    icon: (
      <Image
        src={MoonPhaseImage}
        alt="Moon phase calculator"
        width={130}
        height={130}
        className="h-[130px] w-[128px] object-contain opacity-100"
      />
    ),
  },
  {
    key: 'rashi',
    title: 'Rashi Calculator',
    description: 'Discover your moon sign and understand your Vedic astrology birth chart insights.',
    href: '/calculators/rashi-calculator',
    icon: (
      <Image
        src={RashiCalculatorImage}
        alt="Rashi calculator"
        width={130}
        height={130}
        className="h-[130px] w-[128px] object-contain opacity-100"
      />
    ),
  },
];

export default function CalculatorChooserSection({ exclude }: CalculatorChooserSectionProps) {
  return (
    <div className="mx-auto mt-12 max-w-[1454px]">
      <h2 className="font-sahitya font-bold text-[22px] md:text-[26px] leading-[1.1] text-primary">
        Choose Your Calculator
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
