import type { Metadata } from 'next';

import MangalDoshaCalculatorResultSection from '@/components/pages/calculators/mangal-dosha-calculator/mangal-dosha-calculator-result-section';

export const metadata: Metadata = {
  title: 'Mangal Dosha Calculator Result | AstroSewa',
  description: 'View your Mangal Dosha result and Vedic astrology insights.',
  robots: { index: false },
};

export default function MangalDoshaCalculatorResultPage() {
  return (
    <main>
      <MangalDoshaCalculatorResultSection />
    </main>
  );
}
