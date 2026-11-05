import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AstrologerProfile } from '@/components/astrologers/profile/astrologer-profile';
import { accountHome, accountKind, signInAgainPath } from '@/lib/auth/account';

// Login only, like the app (its root layout guards the profile route): not for search engines.
export const metadata: Metadata = {
  title: 'Astrologer Profile',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function AstrologerProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  // Guests log in, then come back here (shared links included).
  if (!session?.user) redirect(signInAgainPath(`/astrologer-profile/${encodeURIComponent(id)}`));
  // Astrologers and admins don't browse astrologer profiles (the app only lets clients in).
  if (accountKind(session.user.roles) !== 'client') redirect(accountHome(session.user.roles));

  return <AstrologerProfile astrologerId={id} />;
}
