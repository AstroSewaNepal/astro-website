import type { Metadata } from 'next';

import RashiCalculatorResultSection from '@/components/pages/calculators/rashi-calculator/rashi-calculator-result-section';

export const metadata: Metadata = {
  title: 'Rashi Calculator Result | AstroSewa',
  description: 'View your Rashi (moon sign) result and Vedic astrology insights.',
  robots: { index: false },
};

export default function RashiCalculatorResultPage() {
  return (
    <main>
      <RashiCalculatorResultSection />
    </main>
  );
}
