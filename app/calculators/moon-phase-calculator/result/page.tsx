import type { Metadata } from 'next';

import MoonPhaseCalculatorResultSection from '@/components/pages/calculators/moon-phase-calculator/moon-phase-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Moon Phase Calculator Result | AstroSewa',
  description: 'View your moon phase result and lunar energy insights.',
  robots: { index: false },
};

export default function MoonPhaseCalculatorResultPage() {
  return (
    <main className="space-y-12">
      <MoonPhaseCalculatorResultSection />
      <section className="container mx-auto px-4 sm:px-6 lg:px-0 pb-8 md:pb-12">
        <CalculatorChooserSection exclude="moon-phase" />
      </section>
      <Clarity />
      <Services />
      <DownloadApp />
    </main>
  );
}
