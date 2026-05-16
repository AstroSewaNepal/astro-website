import type { Metadata } from 'next';

import SunSignCalculatorSection from '@/components/pages/calculators/sun-sign-calculator/sun-sign-calculator-section';

export const metadata: Metadata = {
  title: 'Sun Sign Calculator',
  description:
    'Discover your sun sign using your birth date and learn what it reveals about your personality.',
  alternates: {
    canonical: '/calculators/sun-sign-calculator',
  },
};

export default function SunSignCalculatorPage() {
  return (
    <main className="space-y-12">
      <SunSignCalculatorSection />
    </main>
  );
}
