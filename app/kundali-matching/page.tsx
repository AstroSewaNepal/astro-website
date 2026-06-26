import type { Metadata } from 'next';

import KmatchingEducationalSection from '@/components/pages/kundali-matcing/kmatching-educational-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
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
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10 space-y-10 md:space-y-[100px]">
      <div className="px-6 lg:px-0">
        <KundaliMatching />
      </div>
      <KmatchingEducationalSection />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
