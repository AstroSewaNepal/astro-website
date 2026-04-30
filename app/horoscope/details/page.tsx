import { Suspense } from 'react';

import { HoroscopeDetailsClient } from './horoscope-details-client';

function HoroscopeDetailsFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center font-mukta text-[#6b5a4e]">
      Loading…
    </div>
  );
}

export default function HoroscopeDetailsPage() {
  return (
    <Suspense fallback={<HoroscopeDetailsFallback />}>
      <HoroscopeDetailsClient />
    </Suspense>
  );
}
