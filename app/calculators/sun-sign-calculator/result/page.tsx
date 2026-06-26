import type { Metadata } from 'next';

import SunSignCalculatorResultSection from '@/components/pages/calculators/sun-sign-calculator/sun-sign-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Sun Sign Calculator Result | AstroSewa',
  description: 'View your sun sign result and explore what it reveals about your personality.',
  robots: { index: false },
};

export default function SunSignCalculatorResultPage() {
  return (
    <main className="space-y-12">
      <SunSignCalculatorResultSection />
      <section className="container mx-auto px-4 sm:px-6 lg:px-0 pb-8 md:pb-12">
        <CalculatorChooserSection exclude="sun-sign" />
      </section>
      <Services />
      <Clarity />
      <DownloadApp />
    </main>
  );
}
