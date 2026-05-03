import { Suspense } from 'react';

import { ZodiacSignDetailsClient } from './zodiac-sign-details-client';

export default function ZodiacDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center font-mukta text-[#6f2618]">
          Loading…
        </div>
      }
    >
      <ZodiacSignDetailsClient />
    </Suspense>
  );
}
