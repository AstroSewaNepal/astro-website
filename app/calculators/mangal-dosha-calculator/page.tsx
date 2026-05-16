import type { Metadata } from 'next';

import MangalDoshaCalculatorSection from '@/components/pages/calculators/mangal-dosha-calculator/mangal-dosha-calculator-section';

export const metadata: Metadata = {
  title: 'Mangal Dosha Calculator',
  description:
    'Check your Mangal Dosha from your birth date and understand how it may influence your marriage prospects.',
  alternates: {
    canonical: '/calculators/mangal-dosha-calculator',
  },
};

export default function MangalDoshaCalculatorPage() {
  return (
    <main className="space-y-12">
      <MangalDoshaCalculatorSection />
    </main>
  );
}
