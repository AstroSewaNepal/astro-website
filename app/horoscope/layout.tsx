import { Suspense } from 'react';

import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import { HoroscopeLocaleProvider } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default function HoroscopeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <HoroscopeLocaleProvider>
        <LandingHeader />
        {children}
      </HoroscopeLocaleProvider>
    </Suspense>
  );
}
