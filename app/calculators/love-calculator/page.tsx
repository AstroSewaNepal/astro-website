import type { Metadata } from 'next';

import LoveCalculatorSection from '@/components/pages/calculators/love-calculator/love-calculator-section';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Love Calculator',
  description:
    'Playfully explore name compatibility with Astro Sewa’s Love Calculator — for fun and curiosity, with the same trusted site experience.',
  alternates: {
    canonical: '/calculators/love-calculator',
  },
};

export default function LoveCalculatorPage() {
  return (
    <main className="min-h-screen pt-6 sm:pt-8 lg:pt-10 space-y-12">
      <LoveCalculatorSection />
      <Services />
      <DownloadApp />
    </main>
  );
}
