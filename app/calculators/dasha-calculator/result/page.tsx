import type { Metadata } from 'next';

import DashaCalculatorResultSection from '@/components/pages/calculators/dasha-calculator/dasha-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Dasha Calculator Result | AstroSewa',
  description: 'View your dasha cycle result and Vedic astrology timing insights.',
  robots: { index: false },
};

export default function DashaCalculatorResultPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <DashaCalculatorResultSection />
      <CalculatorChooserSection exclude="dasha" />

      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
