import type { Metadata } from 'next';

import SunSignCalculatorSection from '@/components/pages/calculators/sun-sign-calculator/sun-sign-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

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
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <SunSignCalculatorSection />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
