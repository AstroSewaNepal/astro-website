import type { Metadata } from 'next';

import LoveCalculatorSection from '@/components/pages/calculators/love-calculator/love-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Love Calculator',
  description:
    'Playfully explore name compatibility with Astro Sewa’s Love Calculator — for fun and curiosity, with the same trusted site experience.',
  alternates: {
    canonical: '/calculators/love-calculator',
  },
};

export default function LoveCalculatorPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <LoveCalculatorSection />
      <Services />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <DownloadApp />
    </main>
  );
}
