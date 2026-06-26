import type { Metadata } from 'next';

import MoonPhaseCalculatorSection from '@/components/pages/calculators/moon-phase-calculator/moon-phase-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Moon Phase Calculator',
  description:
    'Discover the moon phase for a given date and explore the lunar energy that may influence your day.',
  alternates: {
    canonical: '/calculators/moon-phase-calculator',
  },
};

export default function MoonPhaseCalculatorPage() {
  return (
    <main className="space-y-12">
      <MoonPhaseCalculatorSection />
      <Services />
      <Clarity />
      <DownloadApp />
    </main>
  );
}
