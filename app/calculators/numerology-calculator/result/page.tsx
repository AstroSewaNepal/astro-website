import type { Metadata } from 'next';

import NumerologyCalculatorResultSection from '@/components/pages/calculators/numerology-calculator/numerology-calculator-result-section';

export const metadata: Metadata = {
  title: 'Numerology Calculator Result | AstroSewa',
  description: 'View your numerology calculations and learn what your number means.',
  robots: { index: false },
};

export default function NumerologyCalculatorResultPage() {
  return (
    <main>
      <NumerologyCalculatorResultSection />
    </main>
  );
}
