import type { Metadata } from 'next';

import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Download App | Astro Sewa',
  description:
    'Download the Astro Sewa mobile app for instant kundali insights, horoscopes, and astrology services.',
  alternates: {
    canonical: '/download-app',
  },
};

export default function DownloadAppPage() {
  return (
    <main className="min-h-screen pt-6 sm:pt-8 lg:pt-10">
      <div className="container mx-auto px-6 lg:px-0">
        <DownloadApp />
      </div>
    </main>
  );
}
