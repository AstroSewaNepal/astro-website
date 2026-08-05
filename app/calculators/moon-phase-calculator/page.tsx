import type { Metadata } from 'next';

import MoonPhaseCalculatorSection from '@/components/pages/calculators/moon-phase-calculator/moon-phase-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

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
    <main className="container mx-auto px-4 sm:px-6 lg:px-0">
      <MoonPhaseCalculatorSection />
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
