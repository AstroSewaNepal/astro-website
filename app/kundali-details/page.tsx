import type { Metadata } from 'next';

import KundaliDetails from '@/components/pages/kundali-details';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Kundali Details',
  description:
    'Learn what a Kundali is, explore free Janam Kundali and Kundali matching, and connect with Astro Sewa astrologers for personalized guidance.',
  alternates: {
    canonical: '/kundali-details',
  },
  robots: { index: false, follow: false },
};

export default function KundaliDetailsPage() {
  return (
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10">
      <div className="px-6 lg:px-0 space-y-10 md:space-y-[100px]">
        <KundaliDetails />
        <Clarity />
        <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
        <Services />
        <DownloadApp />
      </div>
    </main>
  );
}
