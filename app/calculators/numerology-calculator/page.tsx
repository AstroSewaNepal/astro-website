import type { Metadata } from 'next';

import NumerologyCalculatorSection from '@/components/pages/calculators/numerology-calculator/numerology-calculator-section';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Numerology Calculator',
  description:
    'Calculate your life path and numerology profile with Astro Sewa’s Numerology Calculator. Enter your name and birth date to explore your number insights.',
  alternates: {
    canonical: '/calculators/numerology-calculator',
  },
};

export default function NumerologyCalculatorPage() {
  return (
    <main className="space-y-12">
      <NumerologyCalculatorSection />
      <Services />
      <DownloadApp />
    </main>
  );
}
