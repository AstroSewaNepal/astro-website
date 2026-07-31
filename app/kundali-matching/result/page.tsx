import type { Metadata } from 'next';

import KundaliMatchingResultSection from '@/components/pages/kundali-matcing/kundali-matching-result-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Kundali Matching Result | AstroSewa',
  description:
    'Your Kundali Matching result — view KutaScore, Guna Milan, compatibility categories, and detailed astrological compatibility analysis.',
  robots: { index: false },
};

export default function KundaliMatchingResultPage() {
  return (
    <main className="container mx-auto space-y-12">
      <KundaliMatchingResultSection />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
