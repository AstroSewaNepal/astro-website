import type { Metadata } from 'next';

import RashiCalculatorSection from '@/components/pages/calculators/rashi-calculator/rashi-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Rashi Calculator',
  description:
    'Find your Rashi (moon sign) with your birth date and explore the Vedic astrology meaning behind it.',
  alternates: {
    canonical: '/calculators/rashi-calculator',
  },
};

export default function RashiCalculatorPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <RashiCalculatorSection />
      <Services />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <DownloadApp />
    </main>
  );
}
