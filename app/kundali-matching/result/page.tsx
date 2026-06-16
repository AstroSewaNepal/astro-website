import type { Metadata } from 'next';

import KundaliMatchingResultSection from '@/components/pages/kundali-matcing/kundali-matching-result-section';

export const metadata: Metadata = {
  title: 'Kundali Matching Result | AstroSewa',
  description:
    'Your Kundali Matching result — view KutaScore, Guna Milan, compatibility categories, and detailed astrological compatibility analysis.',
  robots: { index: false },
};

export default function KundaliMatchingResultPage() {
  return (
    <main>
      <KundaliMatchingResultSection />
    </main>
  );
}
