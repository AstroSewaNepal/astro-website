import type { Metadata } from 'next';

import RashiCalculatorResultSection from '@/components/pages/calculators/rashi-calculator/rashi-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Rashi Calculator Result | AstroSewa',
  description: 'View your Rashi (moon sign) result and Vedic astrology insights.',
  robots: { index: false },
};

export default function RashiCalculatorResultPage() {
  return (
    <main className="space-y-12">
      <RashiCalculatorResultSection />
      <section className="container mx-auto px-4 sm:px-6 lg:px-0 pb-8 md:pb-12">
        <CalculatorChooserSection exclude="rashi" />
      </section>
      <Services />
      <Clarity />
      <DownloadApp />
    </main>
  );
}
