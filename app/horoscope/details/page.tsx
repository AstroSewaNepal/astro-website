import type { Metadata } from 'next';
import { Suspense } from 'react';

import { HoroscopeDetailsClient } from './horoscope-details-client';

export const metadata: Metadata = {
  title: 'Horoscope Details',
  description:
    'Read your detailed daily, weekly, or monthly horoscope. Get personalized astrological predictions for love, career, health, and finances based on your zodiac sign.',
  keywords: [
    'horoscope details',
    'daily horoscope',
    'zodiac horoscope',
    'vedic horoscope',
    'horoscope prediction Nepal',
    'weekly horoscope',
    'monthly horoscope',
  ],
  alternates: {
    canonical: '/horoscope/details',
  },
};

function HoroscopeDetailsFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center font-mukta text-[#6b5a4e]">
      Loading…
    </div>
  );
}

export default function HoroscopeDetailsPage() {
  return (
    <Suspense fallback={<HoroscopeDetailsFallback />}>
      <HoroscopeDetailsClient />
    </Suspense>
  );
}
