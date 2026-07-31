import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ZodiacSignDetailsClient } from './zodiac-sign-details-client';

type Props = {
  params: { sign: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const sign = resolvedParams.sign || 'Zodiac';
  const signCapitalized = sign.charAt(0).toUpperCase() + sign.slice(1);

  return {
    title: `${signCapitalized} Zodiac Sign Details`,
    description: `Get in-depth details about the ${signCapitalized} zodiac sign — personality traits, love compatibility, career insights, strengths, and weaknesses based on Vedic astrology.`,
    keywords: [
      `${sign} zodiac details`,
      `${sign} traits`,
      `${sign} compatibility`,
      'zodiac sign details',
      'zodiac traits',
      'zodiac compatibility',
      'vedic astrology sign',
      'rashi details',
    ],
    alternates: {
      canonical: `/zodiac-sign/${sign}`,
    },
  };
}

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
