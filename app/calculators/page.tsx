import type { Metadata } from 'next';

import Calculators from '@/components/pages/calculators';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
export const metadata: Metadata = {
  title: 'Astrology Calculators',
  description:
    "Explore Astro Sewa's astrology calculators and discover deeper insights about your personality, relationships, career, and life journey.",
  alternates: {
    canonical: '/calculators',
  },
  robots: { index: false, follow: false },
};

export default function CalculatorsPage() {
  return (
    <main className="min-h-screen">
      <div className="space-y-10 md:space-y-[100px]">
        <Calculators />
        <Services />
        <DownloadApp />
      </div>
    </main>
  );
}
