import type { Metadata } from 'next';
import clsx from 'clsx';

import LandingPageCSS from '../landing-page.module.css';
import Footer from '@/components/pages/landing/footer';
import KmatchingEducationalSection from '@/components/pages/kundali-matcing/kmatching-educational-section';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import KundaliMatching from '@/components/pages/kundali-matcing';

export const metadata: Metadata = {
  title: 'Kundali Matching',
  description:
    'Discover your match through Kundali with Astro Sewa. Free online Kundali matching with insights on personality, career, relationships, and life path.',
  alternates: {
    canonical: '/kundali-matching',
  },
};

export default function KundaliMatchingPage() {
  return (
    <main className={clsx('min-h-screen space-y-10 md:space-y-[100px]', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
      </div>
      <KundaliMatching />
      <KmatchingEducationalSection />
      <Services />
      <DownloadApp />
      <Footer />
    </main>
  );
}
