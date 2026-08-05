import type { Metadata } from 'next';

import KmatchingEducationalSection from '@/components/pages/kundali-matcing/kmatching-educational-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import KundaliMatching from '@/components/pages/kundali-matcing';
import SectionDivider from '@/components/ui/section-divider';

export const metadata: Metadata = {
  title: 'Free Marriage Compatibility Check | AstroSewa',
  description:
    'Check marriage compatibility using the 36 Guna Milan system. Enter both birth details and get your full Kundali matching report free now.',
  keywords: [
    'Kundali matching',
    'Kundali Milan',
    'marriage compatibility astrology',
    '36 Guna Milan',
    'horoscope matching free',
    'Kundali matching online',
  ],
  alternates: {
    canonical: '/kundali-matching',
  },
};

export default function KundaliMatchingPage() {
  return (
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10">
      <div className="px-6 lg:px-0">
        <KundaliMatching />
      </div>
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <KmatchingEducationalSection />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Clarity />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Services />
      <SectionDivider className="mt-[40px] mb-[10px]" />
      <DownloadApp noBorder />
    </main>
  );
}
