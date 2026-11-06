import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AccountShell } from '@/components/account/account-shell';
import { ClientHome } from '@/components/account/client-home';
import { ComingSoon } from '@/components/account/coming-soon';
import { LoginRedirect } from '@/components/account/login-redirect';
import { accountPageTitle, type PrivateKind } from '@/lib/account/nav';
import { accountHome, accountKind } from '@/lib/auth/account';
import { QueryProvider } from '@/providers/query-provider';

/** Shared layout of /client and /astrologer: the page renders only for a logged-in account of that kind. */
export async function AccountArea({
  kind,
  children,
}: {
  kind: PrivateKind;
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    return (
      <Suspense fallback={null}>
        <LoginRedirect />
      </Suspense>
    );
  }
  if (accountKind(session.user.roles) !== kind) redirect(accountHome(session.user.roles));

  return (
    <QueryProvider>
      <AccountShell kind={kind}>{children}</AccountShell>
    </QueryProvider>
  );
}

export const accountAreaMetadata: Metadata = {
  robots: { index: false, follow: false },
};

type SlugParams = { params: Promise<{ slug?: string[] }> };

const pathFor = (kind: PrivateKind, slug?: string[]) => ['', kind, ...(slug ?? [])].join('/');

/**
 * Placeholder pages for every menu entry of the area until its feature ships. A real page.tsx at the same path
 * wins over the catch-all, so each feature PR just adds its page.
 */
export function accountPlaceholder(kind: PrivateKind) {
  async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
    const title = accountPageTitle(kind, pathFor(kind, (await params).slug));
    return title ? { title } : {};
  }

  async function Page({ params }: SlugParams) {
    const path = pathFor(kind, (await params).slug);
    const title = accountPageTitle(kind, path);
    if (!title) notFound();

    if (path === `/${kind}`) {
      const session = await auth();
      const firstName = session?.user?.name?.split(' ')[0];
      if (kind === 'client') return <ClientHome firstName={firstName} />;
      return (
        <ComingSoon
          title={firstName ? `Namaste, ${firstName}` : 'Namaste'}
          note="Your bookings, earnings and availability will show here."
        />
      );
    }
    return <ComingSoon title={title} />;
  }

  return { generateMetadata, Page };
}
