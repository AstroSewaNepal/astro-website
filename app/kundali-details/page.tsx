import type { Metadata } from 'next';

import KundaliDetails from '@/components/pages/kundali-details';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Free Birth Chart and Kundali Matching | AstroSewa',
  description:
    'Generate your free Kundali or check Kundali matching for marriage compatibility. Complete Vedic birth chart with planetary positions, Lagna, and Doshas.',
  keywords: [
    'Kundali online',
    'free Kundali chart',
    'Kundali matching online',
    'Janam Kundali',
    'birth chart Vedic astrology',
    'Lagna chart',
  ],
  alternates: {
    canonical: '/kundali-details',
  },
  robots: { index: false, follow: false },
};

export default function KundaliDetailsPage() {
  return (
    <main className="container mx-auto min-h-screen">
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
