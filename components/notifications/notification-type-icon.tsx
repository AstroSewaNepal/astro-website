import { Bell, CalendarCheck, Phone, Radio, UsersRound, Video } from 'lucide-react';

import type { NotificationIcon } from '@/lib/notifications/list';

/** Maroon circle with the notification's kind (list rows and toasts). */
export function NotificationTypeIcon({ icon, video }: { icon: NotificationIcon; video: boolean }) {
  const className = 'h-5 w-5';
  const glyph =
    icon === 'booking' ? (
      <CalendarCheck className={className} />
    ) : icon === 'call' ? (
      video ? (
        <Video className={className} />
      ) : (
        <Phone className={className} />
      )
    ) : icon === 'live' ? (
      <Radio className={className} />
    ) : icon === 'queue' ? (
      <UsersRound className={className} />
    ) : (
      <Bell className={className} />
    );
  return (
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white lg:h-12 lg:w-12"
    >
      {glyph}
    </span>
  );
}
