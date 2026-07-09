import type { Metadata } from 'next';

import MoonPhaseCalculatorResultSection from '@/components/pages/calculators/moon-phase-calculator/moon-phase-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Moon Phase Calculator Result | AstroSewa',
  description: 'View your moon phase result and lunar energy insights.',
  robots: { index: false },
};

export default function MoonPhaseCalculatorResultPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <MoonPhaseCalculatorResultSection />
      <CalculatorChooserSection exclude="moon-phase" />

      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
