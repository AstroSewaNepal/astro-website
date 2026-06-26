import type { Metadata } from 'next';

import RashiCalculatorSection from '@/components/pages/calculators/rashi-calculator/rashi-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Rashi Calculator',
  description:
    'Find your Rashi (moon sign) with your birth date and explore the Vedic astrology meaning behind it.',
  alternates: {
    canonical: '/calculators/rashi-calculator',
  },
};

export default function RashiCalculatorPage() {
  return (
    <main className="space-y-12">
      <RashiCalculatorSection />
      <Services />
      <Clarity />
      <DownloadApp />
    </main>
  );
}
