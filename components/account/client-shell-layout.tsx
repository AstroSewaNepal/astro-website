import { auth } from '@/auth';
import { AccountShell } from '@/components/account/account-shell';
import { accountKind } from '@/lib/auth/account';
import { QueryProvider } from '@/providers/query-provider';

/**
 * Layout of the public pages a client also uses from their account (lib/account/nav isClientShellPage): a logged-in
 * client gets the sidebar and bottom tabs, everyone else the plain site layout.
 */
export async function ClientShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isClient = accountKind(session?.user?.roles) === 'client';
  return (
    <QueryProvider>
      {isClient ? (
        <AccountShell kind="client">{children}</AccountShell>
      ) : (
        <main className="container mx-auto w-full min-w-0 flex-1 px-4 pb-12 pt-3 font-app lg:px-0">
          {children}
        </main>
      )}
    </QueryProvider>
  );
}
