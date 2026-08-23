'use client';

import UserMenu from '@/components/common/user-menu';
import type { Session } from 'next-auth';

type AdminHeaderProps = {
  user: NonNullable<Session['user']>;
};

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 px-6 border-b border-neutral-200 bg-white flex items-center justify-between shrink-0">
      <div>
        <h1 className="font-mukta text-lg font-medium text-neutral-800">Admin Dashboard</h1>
      </div>

      <UserMenu user={user} triggerClassName="hover:bg-neutral-100" />
    </header>
  );
}
