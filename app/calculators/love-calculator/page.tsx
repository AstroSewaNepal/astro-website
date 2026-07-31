import type { Metadata } from 'next';

import LoveCalculatorSection from '@/components/pages/calculators/love-calculator/love-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Free Love Compatibility Calculator | AstroSewa',
  description:
    'Get your love compatibility score using Vedic Kuta matching. Enter names and birth details and see how your signs and Nakshatras align. Free on AstroSewa.',
  keywords: [
    'love compatibility calculator',
    'astrology love match',
    'Kuta matching score',
    'relationship compatibility astrology',
    'zodiac love calculator',
    'love match by birth date',
  ],
  alternates: {
    canonical: '/calculators/love-calculator',
  },
};

export default function LoveCalculatorPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <LoveCalculatorSection />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <Services />
      <DownloadApp />
    </main>
  );
}
