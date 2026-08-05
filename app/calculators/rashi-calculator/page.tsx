import type { Metadata } from 'next';

import RashiCalculatorSection from '@/components/pages/calculators/rashi-calculator/rashi-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

export const metadata: Metadata = {
  title: 'Free Rashi Calculator | AstroSewa',
  description:
    'Discover your Rashi, your Vedic moon sign, calculated from your exact birth time and location. More accurate than a date-range table. Free on AstroSewa.',
  keywords: [
    'Rashi calculator',
    'Vedic moon sign',
    'Janma Rashi',
    'moon sign astrology',
    'birth moon sign calculator',
    'Rashi finder',
  ],
  alternates: {
    canonical: '/calculators/rashi-calculator',
  },
};

export default function RashiCalculatorPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-0">
      <RashiCalculatorSection />
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
