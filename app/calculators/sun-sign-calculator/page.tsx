import type { Metadata } from 'next';

import SunSignCalculatorSection from '@/components/pages/calculators/sun-sign-calculator/sun-sign-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

export const metadata: Metadata = {
  title: 'Free Sun Sign Calculator | AstroSewa',
  description:
    'Your Vedic sun sign may differ from your Western zodiac. Find your true sidereal sign using the Lahiri ayanamsa. Free on AstroSewa.',
  keywords: [
    'Vedic sun sign calculator',
    'sidereal zodiac calculator',
    'Lahiri ayanamsa',
    'zodiac sign by birth date Vedic',
    'Jyotish sun sign',
    'Western vs Vedic zodiac',
  ],
  alternates: {
    canonical: '/calculators/sun-sign-calculator',
  },
};

export default function SunSignCalculatorPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-0">
      <SunSignCalculatorSection />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Services />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Clarity />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <SectionDivider className="mt-[40px] mb-[10px]" />
      <DownloadApp noBorder />
    </main>
  );
}
