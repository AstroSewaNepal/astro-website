import type { Metadata } from 'next';

import MoonPhaseCalculatorResultSection from '@/components/pages/calculators/moon-phase-calculator/moon-phase-calculator-result-section';

export const metadata: Metadata = {
  title: 'Moon Phase Calculator Result | AstroSewa',
  description: 'View your moon phase result and lunar energy insights.',
  robots: { index: false },
};

export default function MoonPhaseCalculatorResultPage() {
  return (
    <main>
      <MoonPhaseCalculatorResultSection />
    </main>
  );
}
