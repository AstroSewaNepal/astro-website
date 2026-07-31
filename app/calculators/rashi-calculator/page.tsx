import type { Metadata } from 'next';

import RashiCalculatorSection from '@/components/pages/calculators/rashi-calculator/rashi-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Free Rashi Calculator | AstroSewa',
  description:
    'Discover your Rashi, your Vedic moon sign, calculated from your exact birth time and location. More accurate than a date-range table. Free on AstroSewa.',
  keywords: [
    'Rashi calculator',
    'Vedic moon sign',
    'Janma Rashi',
    'moon sign astrology',
    'birth moon sign calculator',
    'Rashi finder',
  ],
  alternates: {
    canonical: '/calculators/rashi-calculator',
  },
};

export default function RashiCalculatorPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <RashiCalculatorSection />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
