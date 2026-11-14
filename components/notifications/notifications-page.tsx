'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Bell,
  BellOff,
  CalendarCheck,
  Check,
  Loader2,
  Phone,
  Radio,
  Trash2,
  UsersRound,
  Video,
} from 'lucide-react';
import clsx from 'clsx';

import { useBackendClient } from '@/hooks/use-backend-client';
import { useUnreadNotifications } from '@/hooks/use-unread-notifications';
import type { PrivateKind } from '@/lib/account/nav';
import {
  announceNotificationsChanged,
  groupNotificationsByDay,
  nextNotificationsPage,
  type NotificationIcon,
  notificationHref,
  notificationIcon,
  notificationsPath,
  notificationTime,
  type UserNotification,
} from '@/lib/notifications/list';

type ListPage = { items: UserNotification[]; page: number; next: number | undefined };
type ListData = InfiniteData<ListPage, number>;

const QUERY_KEY = ['notifications', 'list'] as const;

/**
 * Notifications page for clients and astrologers: the pushes the app gets (bookings, reminders, calls, live queue,
 * astrologer went live), saved by the backend so web users without push still see them. Tap opens the page the push
 * opens and marks it read.
 */
export function NotificationsPage({ kind }: { kind: PrivateKind }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();

  const list = useInfiniteQuery({
    queryKey: QUERY_KEY,
    queryFn: async ({ pageParam }): Promise<ListPage> => {
      const result = await backend.request<UserNotification[]>('GET', notificationsPath(pageParam));
      const items = Array.isArray(result.data) ? result.data : [];
      return {
        items,
        page: pageParam,
        next: nextNotificationsPage(pageParam, items.length, result.pagination?.total),
      };
    },
    initialPageParam: 1,
    getNextPageParam: last => last.next,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });


  const items = useMemo(() => (list.data?.pages ?? []).flatMap(p => p.items), [list.data]);
  const groups = useMemo(() => groupNotificationsByDay(items), [items]);
  const unreadShown = items.filter(n => !n.readAt).length;
  const anyUnread = unreadShown > 0;

  // New ones arriving while the page is open: the header bell already checks the count once a minute, so the list
  // reloads when that count RISES past what it shows, instead of polling on its own (one request a minute per tab,
  // not two). Only rises: reading/deleting here lowers the list first and the bell a moment later, which must not
  // reload (it would bring back rows the server hasn't marked yet).
  const unread = useUnreadNotifications();
  const lastUnread = useRef(unread);
  useEffect(() => {
    const rose = unread > lastUnread.current;
    lastUnread.current = unread;
    if (rose && !list.isPending && unread > unreadShown) {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  }, [unread, unreadShown, list.isPending, queryClient]);

  // The other way round: this page loaded rows newer than the bell's last check (e.g. opened by a link, so the header
  // didn't re-check). More unread here than the bell counts = the bell is behind: re-check now, not at its next minute.
  useEffect(() => {
    if (!list.isPending && unreadShown > unread) announceNotificationsChanged();
  }, [unread, unreadShown, list.isPending]);

  /** Changes the cached rows in place, so the list doesn't jump while the server catches up. */
  const editCache = (edit: (n: UserNotification) => UserNotification | null) =>
    queryClient.setQueryData<ListData>(QUERY_KEY, data =>
      data
        ? {
            ...data,
            pages: data.pages.map(p => ({
              ...p,
              items: p.items.map(edit).filter((n): n is UserNotification => n !== null),
            })),
          }
        : data,
    );
  const now = () => new Date().toISOString();
  const settle = {
    // Server failed: reload the truth. Either way the bell recounts.
    onError: () => void queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    onSettled: () => announceNotificationsChanged(),
  };

  const markRead = useMutation({
    mutationFn: (id: string) => backend.patch(`/notifications/${id}/read`),
    onMutate: id => editCache(n => (n._id === id && !n.readAt ? { ...n, readAt: now() } : n)),
    ...settle,
  });
  const markAll = useMutation({
    mutationFn: () => backend.patch('/notifications/read-all'),
    onMutate: () => editCache(n => (n.readAt ? n : { ...n, readAt: now() })),
    ...settle,
  });
  const remove = useMutation({
    mutationFn: (id: string) => backend.delete(`/notifications/${id}`),
    onMutate: id => editCache(n => (n._id === id ? null : n)),
    ...settle,
  });

  // Infinite scroll, as My Payments.
  const end = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  useEffect(() => {
    const node = end.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-[28px] font-normal text-primary lg:text-[34px]">Notifications</h1>
        {anyUnread ? (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary px-3.5 py-1.5 font-app text-[14px] text-primary hover:bg-primary/[0.06] disabled:opacity-60"
          >
            <Check className="h-4 w-4" aria-hidden />
            Mark all as read
          </button>
        ) : null}
      </div>

      {list.isPending ? (
        <div className="flex justify-center py-20" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : list.isError && items.length === 0 ? (
        <div className="py-16 text-center font-app text-[17px] text-[#4a1a1a]">
          <p>We could not load your notifications.</p>
          <button type="button" onClick={() => list.refetch()} className="mt-2 text-primary underline">
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <BellOff className="h-14 w-14 text-primary/60" aria-hidden />
          <p className="font-app text-[17px] text-[#4a1a1a]">No notifications yet</p>
          <p className="max-w-sm font-app text-[14px] text-[#6d6d6d]">
            Booking updates, reminders, calls and live alerts will show here.
          </p>
        </div>
      ) : (
        <>
          {groups.map(group => (
            <section key={group.label} className="mb-2" aria-label={group.label}>
              <h2 className="mb-1 mt-3 text-[20px] font-medium text-primary lg:text-[22px]">
                {group.label}
              </h2>
              <ul>
                {group.items.map(n => (
                  <NotificationRow
                    key={n._id}
                    notification={n}
                    href={notificationHref(n, kind)}
                    onOpen={() => {
                      if (!n.readAt) markRead.mutate(n._id);
                    }}
                    onMarkRead={() => markRead.mutate(n._id)}
                    onDelete={() => remove.mutate(n._id)}
                  />
                ))}
              </ul>
            </section>
          ))}
          <div ref={end} />
          {isFetchingNextPage ? (
            <Loader2 className="mx-auto my-6 h-6 w-6 animate-spin text-primary" aria-label="Loading" />
          ) : null}
        </>
      )}
    </div>
  );
}

function RowIcon({ icon, video }: { icon: NotificationIcon; video: boolean }) {
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

function NotificationRow({
  notification: n,
  href,
  onOpen,
  onMarkRead,
  onDelete,
}: {
  notification: UserNotification;
  href: string;
  onOpen: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const unread = !n.readAt;
  const icon = notificationIcon(n);
  return (
    <li className="flex items-start gap-2 border-b border-dashed border-[#BE7B71]/60 py-3 font-app last:border-b-0">
      <Link href={href} onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 lg:gap-4">
        <RowIcon icon={icon} video={n.data?.callType !== 'audio'} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span
              className={clsx(
                'min-w-0 line-clamp-2 break-words text-[17px] leading-snug lg:text-[19px]',
                unread ? 'font-semibold text-primary' : 'text-[#4a1a1a]',
              )}
            >
              {unread ? (
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#d92d20] align-middle" aria-hidden />
              ) : null}
              {n.title}
              {unread ? <span className="sr-only"> (unread)</span> : null}
            </span>
            <span className="shrink-0 text-[12px] text-[#6d6d6d] lg:text-[13px]">
              {notificationTime(n.createdAt)}
            </span>
          </span>
          <span className="mt-0.5 block text-[14px] leading-snug text-[#6d5a50] lg:text-[15px]">{n.body}</span>
        </span>
      </Link>
      <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
        {unread ? (
          <button
            type="button"
            onClick={onMarkRead}
            aria-label={`Mark "${n.title}" as read`}
            title="Mark as read"
            className="hidden h-9 w-9 items-center justify-center rounded-lg bg-primary text-white hover:opacity-90 sm:flex"
          >
            <Check className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete "${n.title}"`}
          title="Delete"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbe4e2] text-[#b3261e] hover:bg-[#f6d2ce]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </span>
    </li>
  );
}
