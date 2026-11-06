import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { accountHome, accountKind, signInAgainPath } from '@/lib/auth/account';

/**
 * Client-only pages (the app's user routes): guests log in and come back to `here` (shared links included);
 * astrologers and admins go to their own home, since the app only lets clients in.
 */
export async function requireClient(here: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect(signInAgainPath(here));
  if (accountKind(session.user.roles) !== 'client') redirect(accountHome(session.user.roles));
}
