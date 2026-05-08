import type { Metadata } from 'next';

import { ZodiacSignListing } from '@/components/pages/zodiac-sign/zodiac-sign-listing';

export const metadata: Metadata = {
  title: 'राशिफल — नेपाली राशि चिन्ह',
  description:
    'नेपाली ज्योतिषशास्त्रमा सबै १२ राशि चिन्हहरू — मेष, वृष, मिथुन, कर्कट, सिंह, कन्या, तुला, वृश्चिक, धनु, मकर, कुम्भ, मीन। आफ्नो राशि जान्नुहोस्।',
  keywords: [
    'नेपाली राशिफल',
    'nepali rashi',
    'nepali zodiac signs',
    'rashi nepal',
    'nepali astrology zodiac',
    'rashifal nepal',
  ],
  alternates: {
    canonical: '/zodiac-sign/zodiac-nepali',
  },
  openGraph: {
    title: 'नेपाली राशि चिन्ह — Nepali Zodiac Signs | Astro Sewa',
    description: 'नेपाली ज्योतिषशास्त्रमा सबै १२ राशि चिन्हहरूको विस्तृत विवरण।',
  },
};

export default function ZodiacNepaliPage() {
  return <ZodiacSignListing mode="hub-ne" />;
}
