import type { Metadata } from 'next';

import LoveCalculatorResultSection from '@/components/pages/calculators/love-calculator/love-calculator-result-section';
import CalculatorChooserSection from '@/components/pages/calculators/shared/calculator-chooser-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Love Calculator Result | AstroSewa',
  description: 'View your lovers report and compatibility match score.',
  robots: { index: false },
};

export default function LoveCalculatorResultPage() {
  return (
    <main className="space-y-12">
      <LoveCalculatorResultSection />
      <section className="container mx-auto px-4 sm:px-6 lg:px-0 pb-8 md:pb-12">
        <CalculatorChooserSection exclude="love" />
      </section>
      <Clarity />
      <Services />
      <DownloadApp />
    </main>
  );
}
