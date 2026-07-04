import type { Metadata } from 'next';

import MoonPhaseCalculatorSection from '@/components/pages/calculators/moon-phase-calculator/moon-phase-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Moon Phase Calculator',
  description:
    'Discover the moon phase for a given date and explore the lunar energy that may influence your day.',
  alternates: {
    canonical: '/calculators/moon-phase-calculator',
  },
};

export default function MoonPhaseCalculatorPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <MoonPhaseCalculatorSection />
      <Services />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <DownloadApp />
    </main>
  );
}
