import type { Metadata } from 'next';

import MangalDoshaCalculatorResultSection from '@/components/pages/calculators/mangal-dosha-calculator/mangal-dosha-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Mangal Dosha Calculator Result | AstroSewa',
  description: 'View your Mangal Dosha result and Vedic astrology insights.',
  robots: { index: false },
};

export default function MangalDoshaCalculatorResultPage() {
  return (
    <main className="space-y-12">
      <MangalDoshaCalculatorResultSection />
      <section className="container mx-auto px-4 sm:px-6 lg:px-0 pb-8 md:pb-12">
        <CalculatorChooserSection exclude="mangal-dosha" />
      </section>
      <Services />
      <Clarity />
      <DownloadApp />
    </main>
  );
}
