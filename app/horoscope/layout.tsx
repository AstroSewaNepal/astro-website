import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Daily Horoscope — Vedic Predictions for All Zodiac Signs',
  description:
    'Read today\'s daily horoscope, weekly and monthly predictions for all 12 zodiac signs. Personalized Vedic astrology insights for love, career, health, and more by Astro Sewa.',
  keywords: [
    'daily horoscope',
    'today horoscope',
    'vedic horoscope',
    'zodiac horoscope Nepal',
    'weekly horoscope',
    'monthly horoscope',
    'horoscope predictions',
    'rashifal',
  ],
  alternates: {
    canonical: '/horoscope',
  },
  openGraph: {
    title: 'Daily Horoscope — Vedic Predictions for All Signs | Astro Sewa',
    description:
      'Get daily, weekly, and monthly Vedic horoscope predictions for all 12 zodiac signs from Astro Sewa Nepal.',
  },
};

export default function HoroscopeSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
