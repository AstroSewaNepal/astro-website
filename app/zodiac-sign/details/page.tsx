import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ZodiacSignDetailsClient } from './zodiac-sign-details-client';

export const metadata: Metadata = {
  title: 'Zodiac Sign Details',
  description:
    'Get in-depth details about your zodiac sign — personality traits, love compatibility, career insights, strengths, and weaknesses based on Vedic astrology.',
  keywords: [
    'zodiac sign details',
    'zodiac traits',
    'zodiac compatibility',
    'vedic astrology sign',
    'rashi details',
  ],
  alternates: {
    canonical: '/zodiac-sign/details',
  },
};

export default function ZodiacDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mukta text-[#6f2618]">
          Loading…
        </div>
      }
    >
      <ZodiacSignDetailsClient />
    </Suspense>
  );
}
