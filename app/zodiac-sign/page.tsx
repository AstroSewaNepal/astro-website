import type { Metadata } from 'next';

import { ZodiacSignListing } from '@/components/pages/zodiac-sign/zodiac-sign-listing';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';

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
  return (
    <main className="container mx-auto space-y-[100px] px-4 sm:px-6 lg:px-0">
      <ZodiacSignListing mode="hub-en" />
      <Clarity />
      <TalkToOurAstrologer 
        className="mx-auto mt-10 max-w-[1180px] sm:mt-14"
        title="Your Sign Is Just the Beginning"
        description="A sun sign gives you a broad profile. A full Vedic birth chart reading goes deeper and shows your moon sign, rising sign, Dasha period, and the specific planetary influences at work in your life right now. Talk to one of our verified astrologers to get a reading built around your chart."
        descriptionClassName="max-w-full"
      />
      <Services />
      <DownloadApp />
    </main>
  );
}
