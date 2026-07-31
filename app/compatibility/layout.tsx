import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check Your Astrology Love Match | Astrology',
  description:
    "Find out how your zodiac sign connects with your partner's. Check love and emotional compatibility and discover when to go deeper with Kundali matching.",
  keywords: [
    'zodiac compatibility',
    'love compatibility astrology',
    'zodiac love match',
    'horoscope compatibility checker',
    'astrology relationship match',
    'sign compatibility',
  ],
  alternates: {
    canonical: '/compatibility',
  },
  openGraph: {
    title: 'Check Your Astrology Love Match | Astrology | Astro Sewa',
    description:
      "Find out how your zodiac sign connects with your partner's. Check love and emotional compatibility and discover when to go deeper with Kundali matching.",
  },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
