import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compatibility Match Results',
  description:
    'View your detailed zodiac compatibility results — love, friendship, communication, and more. Get Vedic astrology insights for your sign pairing from Astro Sewa.',
  keywords: [
    'zodiac compatibility match',
    'love compatibility result',
    'sign match astrology',
    'vedic compatibility score',
    'kundali matching result',
  ],
  alternates: {
    canonical: '/compatibility/compatibilityMatch',
  },
  openGraph: {
    title: 'Zodiac Compatibility Match Results | Astro Sewa',
    description:
      'See your detailed zodiac compatibility scores for love, friendship, sex, and communication based on Vedic astrology.',
  },
};

export default function CompatibilityMatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
