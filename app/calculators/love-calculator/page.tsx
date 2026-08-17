import type { Metadata } from 'next';

import LoveCalculatorSection from '@/components/pages/calculators/love-calculator/love-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

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
    <main className="container mx-auto px-4 sm:px-6 lg:px-0">
      <LoveCalculatorSection />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Services />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <Clarity />
      <SectionDivider className="mt-[20px] mb-[50px]" />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <SectionDivider className="mt-[40px] mb-[10px]" />
      <DownloadApp noBorder />
    </main>
  );
}
