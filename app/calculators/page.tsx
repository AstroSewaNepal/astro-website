import type { Metadata } from 'next';

import Calculators from '@/components/pages/calculators';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
export const metadata: Metadata = {
  title: 'Astrology Calculators',
  description:
    "Explore Astro Sewa's astrology calculators and discover deeper insights about your personality, relationships, career, and life journey.",
  alternates: {
    canonical: '/calculators',
  },
};

export default function CalculatorsPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <Calculators />
      <Services />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <DownloadApp />
    </main>
  );
}
