import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ZodiacSignDetailNepaliClient } from './zodiac-sign-detail-nepali-client';

export const metadata: Metadata = {
  title: 'राशि विवरण — नेपाली राशि विस्तृत जानकारी',
  description:
    'नेपाली ज्योतिषशास्त्रमा आफ्नो राशिको विस्तृत जानकारी — व्यक्तित्व, प्रेम, करियर, शक्ति र कमजोरीहरू।',
  keywords: [
    'rashi detail nepali',
    'nepali zodiac detail',
    'rashi vivaran',
    'nepali astrology sign detail',
  ],
  alternates: {
    canonical: '/zodiac-sign/zodiac-detailnepali',
  },
};

export default function ZodiacDetailNepaliPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mukta text-[#6f2618]">
          Loading…
        </div>
      }
    >
      <ZodiacSignDetailNepaliClient />
    </Suspense>
  );
}
