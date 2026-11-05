'use client';

import { Suspense, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';

import LandingPageCSS from '@/app/landing-page.module.css';
import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import { isAccountPage, isClientShellPage } from '@/lib/account/nav';
import { accountKind } from '@/lib/auth/account';
import { HoroscopeLocaleProvider } from '@/lib/i18n';

/** Paths that use their own chrome (admin, auth) — no marketing header/footer/locale shell. */
// /login (client + astrologer sign-in) keeps the site header and footer, like the Figma.
const STANDALONE_PREFIXES = ['/admin', '/sign-in'] as const;
function usesMarketingChrome(pathname: string | null): boolean {
  if (!pathname) return true;
  return !STANDALONE_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Common shell for marketing pages: `HoroscopeLocaleProvider`, `LandingHeader`, page content, `Footer`.
 * Skipped for admin and auth routes so those UIs stay full-screen without duplicate chrome.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const hasTabs =
    isAccountPage(pathname) ||
    (isClientShellPage(pathname) && accountKind(session?.user?.roles) === 'client');
  const wrap = useMemo(() => usesMarketingChrome(pathname), [pathname]);

  if (!wrap) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={null}>
      <HoroscopeLocaleProvider>
        <div
          className={clsx(
            LandingPageCSS.background,
            'flex min-h-screen min-w-0 flex-col',
            // room for the fixed bottom tabs of the logged-in pages on phones (the footer pads the home bar)
            hasTabs && 'pb-16 lg:pb-0',
          )}
        >
          <LandingHeader />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <Footer />
        </div>
      </HoroscopeLocaleProvider>
    </Suspense>
  );
}
