import type { Metadata } from 'next';

import DashaCalculatorResultSection from '@/components/pages/calculators/dasha-calculator/dasha-calculator-result-section';

export const metadata: Metadata = {
  title: 'Dasha Calculator Result | AstroSewa',
  description: 'View your dasha cycle result and Vedic astrology timing insights.',
  robots: { index: false },
};

export default function DashaCalculatorResultPage() {
  return (
    <main>
      <DashaCalculatorResultSection />
    </main>
  );
}
