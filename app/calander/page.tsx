import type { Metadata } from 'next';

import CalanderPageContent from '@/components/pages/calander/index';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Nepali Calendar & Panchang',
  description:
    'View today\'s Nepali Panchang calendar with tithi, nakshatra, yoga, karana, and auspicious timings. Free daily Panchang by Astro Sewa Nepal.',
  keywords: [
    'nepali calendar',
    'panchang',
    'nepali panchang',
    'tithi',
    'nakshatra',
    'auspicious timings Nepal',
    'nepali astrology calendar',
  ],
  alternates: {
    canonical: '/calander',
  },
  openGraph: {
    title: 'Nepali Calendar & Panchang | Astro Sewa',
    description:
      'Free daily Nepali Panchang with tithi, nakshatra, yoga, karana, and auspicious timings for Nepal.',
  },
};

export default function CalanderPage() {
  return (
    <main className="min-h-screen">
      <div className="space-y-10 md:space-y-[100px]">
        <CalanderPageContent />
        <Services />
        <DownloadApp />
      </div>
    </main>
  );
}
