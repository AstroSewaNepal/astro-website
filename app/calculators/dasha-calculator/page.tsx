import type { Metadata } from 'next';

import DashaCalculatorSection from '@/components/pages/calculators/dasha-calculator/dasha-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

export const metadata: Metadata = {
  title: 'Free MahaDasha Period Calculator | AstroSewa',
  description:
    'Discover your current Mahadasha and Antardasha free. Enter your birth details and get your full Vimshottari Dasha timeline on AstroSewa. Start now.',
  keywords: [
    'Dasha calculator',
    'Mahadasha calculator',
    'Vimshottari Dasha',
    'Antardasha calculator',
    'planetary period Vedic astrology',
    'current Dasha period',
  ],
  alternates: {
    canonical: '/calculators/dasha-calculator',
  },
};

export default function DashaCalculatorPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-0">
      <DashaCalculatorSection />
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
