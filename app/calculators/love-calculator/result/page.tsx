import type { Metadata } from 'next';

import LoveCalculatorResultSection from '@/components/pages/calculators/love-calculator/love-calculator-result-section';

export const metadata: Metadata = {
  title: 'Love Calculator Result | AstroSewa',
  description: 'View your lovers report and compatibility match score.',
  robots: { index: false },
};

export default function LoveCalculatorResultPage() {
  return (
    <main>
      <LoveCalculatorResultSection />
    </main>
  );
}
