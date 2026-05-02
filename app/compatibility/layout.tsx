import { Suspense } from 'react';

import { HoroscopeLocaleProvider } from '@/lib/i18n';

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <HoroscopeLocaleProvider>{children}</HoroscopeLocaleProvider>
    </Suspense>
  );
}
