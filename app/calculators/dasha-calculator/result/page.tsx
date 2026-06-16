import type { Metadata } from 'next';

import DashaCalculatorResultSection from '@/components/pages/calculators/dasha-calculator/dasha-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Dasha Calculator Result | AstroSewa',
  description: 'View your dasha cycle result and Vedic astrology timing insights.',
  robots: { index: false },
};

export default function DashaCalculatorResultPage() {
  return (
    <main className="space-y-12">
      <DashaCalculatorResultSection />
      <section className="container mx-auto px-4 sm:px-6 lg:px-0 pb-8 md:pb-12">
        <CalculatorChooserSection exclude="dasha" />
      </section>
      <Clarity />
      <Services />
      <DownloadApp />
    </main>
  );
}
