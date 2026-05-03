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
};

export default function CalculatorsPage() {
  return (
    <main className="min-h-screen space-y-12">
      <div className="-mt-6 md:-mt-10">
        <Calculators />
      </div>
      <Services />
      <DownloadApp />
    </main>
  );
}
