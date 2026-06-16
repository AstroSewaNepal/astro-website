import type { Metadata } from 'next';

import NumerologyCalculatorResultSection from '@/components/pages/calculators/numerology-calculator/numerology-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Numerology Calculator Result | AstroSewa',
  description: 'View your numerology calculations and learn what your number means.',
  robots: { index: false },
};

export default function NumerologyCalculatorResultPage() {
  return (
    <main className="space-y-12">
      <NumerologyCalculatorResultSection />
      <section className="container mx-auto px-4 sm:px-6 lg:px-0 pb-8 md:pb-12">
        <CalculatorChooserSection exclude="numerology" />
      </section>
      <Clarity />
      <Services />
      <DownloadApp />
    </main>
  );
}
