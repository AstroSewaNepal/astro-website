import type { Metadata } from 'next';

import KundaliDetails from '@/components/pages/kundali-details';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Kundali Details',
  description:
    'Learn what a Kundali is, explore free Janam Kundali and Kundali matching, and connect with Astro Sewa astrologers for personalized guidance.',
  alternates: {
    canonical: '/kundali-details',
  },
};

export default function KundaliDetailsPage() {
  return (
    <main className="min-h-screen">
      <div className="space-y-10 md:space-y-[100px]">
        <KundaliDetails />
        <Services />
        <DownloadApp />
      </div>
    </main>
  );
}
