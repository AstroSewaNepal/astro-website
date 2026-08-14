import type { Metadata } from 'next';

import MangalDoshaCalculatorSection from '@/components/pages/calculators/mangal-dosha-calculator/mangal-dosha-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

export const metadata: Metadata = {
  title: 'Check Your Manglik Status Free | AstroSewa',
  description:
    'Find out if you have Mangal Dosha in your birth chart. Real chart-based check using actual planetary positions. Get your result free on AstroSewa.',
  keywords: [
    'Mangal Dosha calculator',
    'Manglik calculator',
    'Kuja Dosha',
    'check Mangal Dosha online',
    'Manglik status',
    'Mars Dosha astrology',
  ],
  alternates: {
    canonical: '/calculators/mangal-dosha-calculator',
  },
};

export default function MangalDoshaCalculatorPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-0">
      <MangalDoshaCalculatorSection />
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
