import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { LiveBlocked } from '@/components/live/live-blocked';
import { LiveViewer } from '@/components/live/live-viewer';
import { accountHome, accountKind, signInAgainPath } from '@/lib/auth/account';
import { livePath } from '@/lib/live/feed';

type Props = { params: Promise<{ astrologerId: string }> };

export const metadata: Metadata = { title: 'Live', robots: { index: false } };

/**
 * Watching one astrologer's stream (the app's live-viewer route; the share link carries only the astrologerId).
 * Guests log in and come back here; astrologer accounts can't watch (the app's rule); admins go to their area.
 */
export default async function LiveViewerPage({ params }: Props) {
  const { astrologerId } = await params;
  const session = await auth();
  if (!session?.user) redirect(signInAgainPath(livePath(astrologerId)));
  const kind = accountKind(session.user.roles);
  if (kind === 'astrologer') return <LiveBlocked />;
  if (kind !== 'client') redirect(accountHome(session.user.roles));
  return (
    <LiveViewer
      astrologerId={astrologerId}
      me={{ id: session.user.id ?? '', name: session.user.name ?? 'Viewer' }}
    />
  );
}
