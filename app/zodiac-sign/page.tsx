import type { Metadata } from 'next';

import { ZodiacSignListing } from '@/components/pages/zodiac-sign/zodiac-sign-listing';

export const metadata: Metadata = {
  title: 'Zodiac Signs — All 12 Signs & Their Meanings',
  description:
    'Explore all 12 zodiac signs — Aries to Pisces. Learn personality traits, compatibility, strengths, weaknesses, and Vedic astrology insights for each sun sign.',
  keywords: [
    'zodiac signs',
    'all zodiac signs',
    'sun signs',
    'zodiac personality',
    'vedic zodiac',
    'aries taurus gemini cancer leo virgo libra scorpio sagittarius capricorn aquarius pisces',
    'rashi',
  ],
  alternates: {
    canonical: '/zodiac-sign',
  },
  openGraph: {
    title: 'Zodiac Signs — All 12 Signs & Their Meanings | Astro Sewa',
    description:
      'Discover the personality traits, compatibility, and Vedic insights for all 12 zodiac signs.',
  },
};

export default function ZodiacSignsPage() {
  return <ZodiacSignListing mode="hub-en" />;
}
