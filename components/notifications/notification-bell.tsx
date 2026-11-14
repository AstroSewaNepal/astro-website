'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import TransparentBellIcon from '@/components/icons/bell';
import { useUnreadNotifications } from '@/hooks/use-unread-notifications';
import type { PrivateKind } from '@/lib/account/nav';
import { notificationsPagePath, unreadBadge } from '@/lib/notifications/list';

/** Header bell (Figma: maroon circle right of Profile) with the unread count; opens the notifications page. */
export function NotificationBell({ kind }: { kind: PrivateKind }) {
  const count = useUnreadNotifications();
  const badge = unreadBadge(count);
  const href = notificationsPagePath(kind);
  const here = usePathname() === href;

  return (
    <Link
      href={href}
      aria-current={here ? 'page' : undefined}
      aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
      className={clsx(
        'relative flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-primary text-white lg:h-[44px] lg:w-[44px]',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      )}
    >
      <TransparentBellIcon className="h-[22px] w-[22px] lg:h-6 lg:w-6" />
      {badge ? (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#fbf7ee] bg-[#d92d20] px-1 font-app text-[10px] font-bold leading-none text-white"
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
