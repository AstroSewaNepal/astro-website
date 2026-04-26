import type { Metadata } from 'next';
import clsx from 'clsx';

import LandingPageCSS from '../landing-page.module.css';
import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
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
    <main className={clsx('min-h-screen space-y-12', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
      </div>
      <div className="-mt-6 md:-mt-10">
        <Calculators />
      </div>
      <Services />
      <DownloadApp />
      <Footer />
    </main>
  );
}
