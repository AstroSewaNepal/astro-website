import type { Metadata } from 'next';

import DashaCalculatorSection from '@/components/pages/calculators/dasha-calculator/dasha-calculator-section';

export const metadata: Metadata = {
  title: 'Dasha Calculator',
  description:
    'Calculate your current dasha cycle and learn what kind of life phase you are in based on your birth date.',
  alternates: {
    canonical: '/calculators/dasha-calculator',
  },
};

export default function DashaCalculatorPage() {
  return (
    <main className="space-y-12">
      <DashaCalculatorSection />
    </main>
  );
}
