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
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto">
        <KundaliMatchingResultSection />
      </div>
    </main>
  );
}
