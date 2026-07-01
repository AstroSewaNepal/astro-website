import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ZodiacSignDetailNepaliClient } from './zodiac-sign-detail-nepali-client';

export const metadata: Metadata = {
  title: 'Zodiac Sign Details (Nepali)',
  description:
    'Get in-depth details about your zodiac sign in Nepali — personality traits, compatibility, strengths, and weaknesses based on Vedic astrology.',
  alternates: {
    canonical: '/zodiac-sign/zodiac-detailnepali',
  },
};

export default function ZodiacDetailNepaliPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mukta text-[#6f2618]">
          Loading…
        </div>
      }
    >
      <ZodiacSignDetailNepaliClient />
    </Suspense>
  );
}
