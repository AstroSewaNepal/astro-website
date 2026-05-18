import type { Metadata } from 'next';
import type { ReactNode } from 'react';

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

export default function HoroscopeDetailsLayout({ children }: { children: ReactNode }) {
  return children;
}
