import type { Metadata } from 'next';

import SunSignCalculatorResultSection from '@/components/pages/calculators/sun-sign-calculator/sun-sign-calculator-result-section';

export const metadata: Metadata = {
  title: 'Sun Sign Calculator Result | AstroSewa',
  description: 'View your sun sign result and explore what it reveals about your personality.',
  robots: { index: false },
};

export default function SunSignCalculatorResultPage() {
  return (
    <main>
      <SunSignCalculatorResultSection />
    </main>
  );
}
