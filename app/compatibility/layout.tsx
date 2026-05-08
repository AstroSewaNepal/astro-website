import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zodiac Compatibility — Find Your Perfect Match',
  description:
    'Check zodiac sign compatibility for love, friendship, and more. Discover how well your signs match based on Vedic astrology. Free compatibility tool by Astro Sewa Nepal.',
  keywords: [
    'zodiac compatibility',
    'love compatibility',
    'astrology compatibility',
    'sign compatibility',
    'vedic compatibility',
    'kundali match',
    'rashi milan Nepal',
  ],
  alternates: {
    canonical: '/compatibility',
  },
  openGraph: {
    title: 'Zodiac Compatibility — Find Your Perfect Match | Astro Sewa',
    description:
      'Discover your zodiac compatibility for love, friendship, and relationships using Vedic astrology.',
  },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
