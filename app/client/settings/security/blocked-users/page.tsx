import type { Metadata } from 'next';

import { BlockedUsers } from '@/components/account/settings/blocked-users';

export const metadata: Metadata = { title: 'Blocked users' };

export default function ClientBlockedUsersPage() {
  return <BlockedUsers />;
}
