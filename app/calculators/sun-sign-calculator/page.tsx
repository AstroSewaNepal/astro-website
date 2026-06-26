import type { Metadata } from 'next';

import SunSignCalculatorSection from '@/components/pages/calculators/sun-sign-calculator/sun-sign-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Sun Sign Calculator',
  description:
    'Discover your sun sign using your birth date and learn what it reveals about your personality.',
  alternates: {
    canonical: '/calculators/sun-sign-calculator',
  },
};

export default function SunSignCalculatorPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <SunSignCalculatorSection />
      <Services />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <DownloadApp />
    </main>
  );
}
