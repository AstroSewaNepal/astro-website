import type { Metadata } from 'next';

import DashaCalculatorSection from '@/components/pages/calculators/dasha-calculator/dasha-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Dasha Calculator',
  description:
    'Calculate your current dasha cycle and learn what kind of life phase you are in based on your birth date.',
  alternates: {
    canonical: '/calculators/dasha-calculator',
  },
};

export default function DashaCalculatorPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <DashaCalculatorSection />
      <Services />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <DownloadApp />
    </main>
  );
}
