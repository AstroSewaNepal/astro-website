import type { Metadata } from 'next';

import { FollowingList } from '@/components/account/following-list';

export const metadata: Metadata = { title: 'My Following' };

export default function ClientFollowingPage() {
  return <FollowingList />;
}
