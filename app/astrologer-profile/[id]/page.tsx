import type { Metadata } from 'next';

import { AstrologerProfile } from '@/components/astrologers/profile/astrologer-profile';
import { requireClient } from '@/lib/auth/require-client';

// Login only, like the app (its root layout guards the profile route): not for search engines.
export const metadata: Metadata = {
  title: 'Astrologer Profile',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function AstrologerProfilePage({ params }: Props) {
  const { id } = await params;
  await requireClient(`/astrologer-profile/${encodeURIComponent(id)}`);
  return <AstrologerProfile astrologerId={id} />;
}
