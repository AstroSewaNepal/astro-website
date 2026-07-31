import type { Metadata } from 'next';

import RashiCalculatorResultSection from '@/components/pages/calculators/rashi-calculator/rashi-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Rashi Calculator Result | AstroSewa',
  description: 'View your Rashi (moon sign) result and Vedic astrology insights.',
  robots: { index: false },
};

export default function RashiCalculatorResultPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <RashiCalculatorResultSection />
      <CalculatorChooserSection exclude="rashi" />

      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
