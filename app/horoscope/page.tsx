import type { Metadata } from 'next';

import HoroscopePage from '@/components/pages/horoscope/horoscope-page';

export const metadata: Metadata = {
  title: "Today's Predictions for All 12 Signs | AstroSewa",
  description:
    "Read today's horoscope for your zodiac sign. Love, career, health, and energy predictions updated daily. Find your sign and start reading now.",
  keywords: [
    'daily horoscope',
    "today's horoscope",
    'horoscope for all signs',
    'zodiac sign predictions',
    'Aries horoscope today',
    'weekly horoscope',
  ],
  alternates: {
    canonical: '/horoscope',
  },
};

export default function HoroscopePageRoute() {
  return <HoroscopePage />;
}
