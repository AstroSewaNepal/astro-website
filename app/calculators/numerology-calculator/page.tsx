import type { Metadata } from 'next';

import NumerologyCalculatorSection from '@/components/pages/calculators/numerology-calculator/numerology-calculator-section';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

export const metadata: Metadata = {
  title: 'Numerology Calculator',
  description:
    'Discover your numerology profile using your full birth name and date of birth. Receive a detailed Pythagorean reading for life path, expression, and soul urge numbers.',
  alternates: {
    canonical: '/calculators/numerology-calculator',
  },
};

export default function NumerologyCalculatorPage() {
  return (
    <main className="container mx-auto space-y-12 px-4 sm:px-6 lg:px-0">
      <NumerologyCalculatorSection />
      <Services />
      <Clarity />
      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />
      <DownloadApp />
    </main>
  );
}
