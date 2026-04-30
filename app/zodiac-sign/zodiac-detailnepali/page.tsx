import { Suspense } from 'react';

import { ZodiacSignDetailNepaliClient } from './zodiac-sign-detail-nepali-client';

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
