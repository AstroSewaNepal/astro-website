import type { Metadata } from 'next';

import Calculators from '@/components/pages/calculators';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
export const metadata: Metadata = {
  title: 'Free Astrology Calculators | AstroSewa',
  description:
    'Check Mangal Dosha, find your Rashi, calculate your Dasha, or explore numerology. Free Vedic calculators powered by real ephemeris data. Try one now.',
  keywords: [
    'free astrology calculator',
    'Rashi calculator',
    'Dasha calculator',
    'Mangal Dosha calculator',
    'numerology calculator',
    'love compatibility calculator',
  ],
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
