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
    <main className="pt-2 md:pt-4">
      <div className="container mx-auto px-6 lg:px-0">
        <DownloadApp className="border-none !pb-0" paddingClassName="py-4 md:py-6 lg:py-8" />
      </div>
    </main>
  );
}
