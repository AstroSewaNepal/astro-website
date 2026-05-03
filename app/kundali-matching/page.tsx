import type { Metadata } from 'next';

import KmatchingEducationalSection from '@/components/pages/kundali-matcing/kmatching-educational-section';
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
  robots: { index: false, follow: false },
};

export default function KundaliMatchingPage() {
  return (
    <main className="min-h-screen space-y-10 md:space-y-[100px]">
      <KundaliMatching />
      <KmatchingEducationalSection />
      <Services />
      <DownloadApp />
    </main>
  );
}
