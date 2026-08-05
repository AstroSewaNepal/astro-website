import type { Metadata } from 'next';

import NumerologyCalculatorSection from '@/components/pages/calculators/numerology-calculator/numerology-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import SectionDivider from '@/components/ui/section-divider';

export const metadata: Metadata = {
  title: 'Find Your Life Path Number Free | AstroSewa',
  description:
    'Calculate your Life Path, Expression, and Soul Urge numbers free. Just your name and birth date needed. Try it on AstroSewa.',
  keywords: [
    'numerology calculator',
    'Life Path Number calculator',
    'numerology by name and birth date',
    'Expression Number',
    'Soul Urge Number',
    'Pythagorean numerology',
  ],
  alternates: {
    canonical: '/calculators/numerology-calculator',
  },
};

export default function NumerologyCalculatorPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-0">
      <NumerologyCalculatorSection />
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
