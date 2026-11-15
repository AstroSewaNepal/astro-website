'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { NotificationTypeIcon } from '@/components/notifications/notification-type-icon';
import { useBackendClient } from '@/hooks/use-backend-client';
import { subscribeNotificationToasts } from '@/hooks/use-unread-notifications';
import type { PrivateKind } from '@/lib/account/nav';
import {
  announceNotificationsChanged,
  notificationHref,
  notificationIcon,
  notificationsPagePath,
  type UserNotification,
} from '@/lib/notifications/list';
import { TOAST_SHOW_MS } from '@/lib/notifications/toasts';

type Toast = { n: UserNotification; href: string };

/**
 * Small cards for new notifications on any page (doc 09 step 5): top of the screen on phones, bottom right on
 * desktop. Each hides after 5 s (kept while the pointer is on it); tap = the list row's page, marked read. Not shown
 * on the notifications page (the list itself updates) nor for the page you're already on.
 * Rendered into <body>: the header (where the bell lives) is hidden on full-screen phone pages.
 */
export function NotificationToasts({ kind }: { kind: PrivateKind }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const backend = useBackendClient();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());
  const [mounted, setMounted] = useState(false);

  const here = useRef(pathname);
  useEffect(() => {
    here.current = pathname;
  }, [pathname]);

  const dismiss = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts(list => list.filter(t => t.n._id !== id));
  }, []);

  const startTimer = useCallback(
    (id: string) => {
      window.clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), TOAST_SHOW_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    // Portals need <body>, which only exists after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const pending = timers.current;
    const stop = subscribeNotificationToasts(items => {
      const path = here.current;
      if (path === notificationsPagePath(kind)) return;
      const fresh = items
        .map(n => ({ n, href: notificationHref(n, kind) }))
        .filter(t => t.href !== path);
      if (!fresh.length) return;
      setToasts(list => [...fresh, ...list.filter(t => !fresh.some(f => f.n._id === t.n._id))]);
      fresh.forEach(t => startTimer(t.n._id));
    });
    return () => {
      stop();
      pending.forEach(timer => window.clearTimeout(timer));
      pending.clear();
    };
  }, [kind, startTimer]);

  const open = (toast: Toast) => {
    dismiss(toast.n._id);
    void backend
      .patch(`/notifications/${toast.n._id}/read`)
      .catch(() => undefined)
      .finally(() => announceNotificationsChanged());
    router.push(toast.href);
  };

  if (!mounted || !toasts.length) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[75] flex flex-col gap-2 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:top-auto lg:w-[380px] lg:flex-col-reverse"
    >
      {toasts.map(toast => (
        <div
          key={toast.n._id}
          data-notification-toast={toast.n._id}
          onPointerEnter={() => window.clearTimeout(timers.current.get(toast.n._id))}
          onPointerLeave={() => startTimer(toast.n._id)}
          className="pointer-events-auto flex animate-[toast-in_200ms_ease-out] items-center gap-3 rounded-2xl border border-[#e8ddd0] bg-[#fbf7ee] p-3 font-app shadow-[0_8px_24px_rgba(92,56,23,0.18)] motion-reduce:animate-none"
        >
          <button
            type="button"
            onClick={() => open(toast)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <NotificationTypeIcon
              icon={notificationIcon(toast.n)}
              video={toast.n.data?.callType !== 'audio'}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold leading-snug text-primary">
                {toast.n.title}
              </span>
              <span className="line-clamp-2 text-[14px] leading-snug text-[#6d5a50]">
                {toast.n.body}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[14px] text-white">
              Open
            </span>
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={() => dismiss(toast.n._id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#7a5a4a] hover:bg-[#611508]/[0.06]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
