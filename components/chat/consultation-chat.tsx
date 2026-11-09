'use client';

import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { BadgeCheck, Loader2, SendHorizontal, UserRound, X } from 'lucide-react';
import clsx from 'clsx';

import { useBackendClient } from '@/hooks/use-backend-client';
import {
  chatPartner,
  dayChip,
  dayStarts,
  hasOlderPage,
  historyItems,
  messagesPath,
  messageTime,
  type ChatBooking,
  type ChatItem,
  type ChatMessagesPage,
} from '@/lib/chat/messages';

const TOS_KEY = 'chatTosAndPrivacyAccepted';
/** Load older messages once the reader scrolls this close to the top. */
const OLDER_THRESHOLD_PX = 80;

const noStoreEvents = () => () => {};

function readTosAccepted(): boolean {
  try {
    return localStorage.getItem(TOS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * A consultation's chat (the app's ChatDetailsScreen) in the Figma Chat panel: header, terms banner, history with day
 * chips, composer. This first part shows the history only; sending and live messages come next.
 */
export function ConsultationChat({ bookingId }: { bookingId: string }) {
  const backend = useBackendClient();
  const { data: session } = useSession();
  const myId = session?.user?.id;

  const booking = useQuery({
    queryKey: ['chat', 'booking', bookingId],
    queryFn: () =>
      backend.get<ChatBooking>(`/connection-schedule/${encodeURIComponent(bookingId)}`),
  });
  const chatId = booking.data?.chatId ?? null;

  const history = useInfiniteQuery({
    queryKey: ['chat', 'messages', chatId],
    queryFn: ({ pageParam }) =>
      backend.bare.get<ChatMessagesPage>(messagesPath(chatId!, pageParam)),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (hasOlderPage(last) ? all.length + 1 : undefined),
    enabled: !!chatId,
  });

  const items = useMemo(() => historyItems(history.data?.pages ?? [], myId), [history.data, myId]);
  const partner = chatPartner(booking.data);

  // Stored per browser like the app's MMKV flag; the server render assumes accepted so nothing flashes.
  const tosStored = useSyncExternalStore(noStoreEvents, readTosAccepted, () => true);
  const [tosClosed, setTosClosed] = useState(false);
  const tosAccepted = tosStored || tosClosed;
  const acceptTos = () => {
    setTosClosed(true);
    try {
      localStorage.setItem(TOS_KEY, '1');
    } catch {
      // Private mode: the banner just comes back next time.
    }
  };

  const failed = booking.isError || history.isError || (booking.isSuccess && !chatId);
  const loading = booking.isPending || (!!chatId && history.isPending);

  return (
    <section
      aria-label={`Chat with ${partner.name}`}
      className="flex h-[calc(100dvh-15rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#e8ddd0] bg-[#F8F3DF] shadow-[0_4px_16px_rgba(92,56,23,0.08)] lg:h-[calc(100dvh-12rem)] lg:max-h-[760px]"
    >
      <header className="flex items-center gap-3 border-b border-[#e8ddd0] bg-[#F8F3DF] px-4 py-3 lg:px-6">
        <Avatar photo={partner.photo} name={partner.name} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[17px] font-semibold text-[#611508] lg:text-[19px]">
            <span className="truncate">{booking.isPending ? 'Loading…' : partner.name}</span>
            {booking.data && !booking.data.astrologer?.isPendingDeletion ? (
              <BadgeCheck className="h-4 w-4 shrink-0 text-[#720A0B]" aria-label="Verified" />
            ) : null}
          </p>
        </div>
      </header>

      {!tosAccepted ? (
        <div className="flex items-center gap-3 bg-[#BE7B71] px-4 py-2.5 text-[13px] text-white lg:px-6 lg:text-[15px]">
          <p className="flex-1">
            By continuing, you agree to our{' '}
            <Link
              href="/terms-and-conditions"
              className="font-semibold underline-offset-2 hover:underline"
            >
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy-policy"
              className="font-semibold underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={acceptTos}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#BE7B71]"
          >
            <X className="h-4 w-4" strokeWidth={3} aria-hidden />
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-[#611508]">
          <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading chat" />
        </div>
      ) : failed ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-[#4a1a1a]">
          <p>This chat could not be opened.</p>
          <button
            type="button"
            onClick={() => (booking.isError || !chatId ? booking.refetch() : history.refetch())}
            className="rounded-full border border-[#611508] px-4 py-1.5 text-[#611508]"
          >
            Try again
          </button>
        </div>
      ) : (
        <MessageList
          items={items}
          partner={partner}
          loadingOlder={history.isFetchingNextPage}
          canLoadOlder={!!history.hasNextPage}
          loadOlder={() => history.fetchNextPage()}
        />
      )}

      <form
        onSubmit={e => e.preventDefault()}
        className="flex items-center gap-2 border-t border-[#e8ddd0] bg-[#F8F3DF] px-3 py-3 lg:px-5"
      >
        <input
          type="text"
          disabled
          placeholder="Write message..."
          aria-label="Message"
          className="min-w-0 flex-1 rounded-full border border-[#720A0B] bg-[#F8F3DF] px-4 py-2.5 text-[16px] text-[#1f1a17] placeholder:text-[#8a7a6a] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#720A0B] text-white disabled:opacity-50"
        >
          <SendHorizontal className="h-5 w-5" aria-hidden />
        </button>
      </form>
    </section>
  );
}

function Avatar({ photo, name, small }: { photo: string | null; name: string; small?: boolean }) {
  const size = small ? 'h-7 w-7' : 'h-11 w-11 lg:h-12 lg:w-12';
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element -- backend media URLs (images.unoptimized on the Worker)
    <img
      src={photo}
      alt={small ? '' : name}
      className={clsx(size, 'shrink-0 rounded-full object-cover')}
    />
  ) : (
    <span
      aria-hidden={small}
      className={clsx(
        size,
        'flex shrink-0 items-center justify-center rounded-full bg-[#e8ddd0] text-[#611508]',
      )}
    >
      <UserRound className={small ? 'h-4 w-4' : 'h-6 w-6'} aria-hidden />
    </span>
  );
}

function MessageList({
  items,
  partner,
  loadingOlder,
  canLoadOlder,
  loadOlder,
}: {
  items: ChatItem[];
  partner: { name: string; photo: string | null };
  loadingOlder: boolean;
  canLoadOlder: boolean;
  loadOlder: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const starts = useMemo(() => dayStarts(items), [items]);
  // Keeps the reader's place when older messages are added above, and starts at the newest message.
  const before = useRef<{ height: number; top: number; first: string | null } | null>(null);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const prev = before.current;
    const first = items[0]?.id ?? null;
    if (!prev) el.scrollTop = el.scrollHeight;
    else if (prev.first !== first) el.scrollTop = prev.top + (el.scrollHeight - prev.height);
    before.current = { height: el.scrollHeight, top: el.scrollTop, first };
  }, [items]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    if (before.current)
      before.current = { ...before.current, height: el.scrollHeight, top: el.scrollTop };
    if (el.scrollTop < OLDER_THRESHOLD_PX && canLoadOlder && !loadingOlder) loadOlder();
  };

  return (
    <div
      ref={scroller}
      onScroll={onScroll}
      className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 lg:px-6"
      aria-live="polite"
    >
      {loadingOlder ? (
        <Loader2
          className="mx-auto h-5 w-5 shrink-0 animate-spin text-[#611508]"
          aria-label="Loading older messages"
        />
      ) : null}
      {items.length === 0 ? (
        <p className="m-auto text-center text-[15px] text-[#8a7a6a]">No messages yet.</p>
      ) : (
        items.map((item, i) => (
          <div key={item.id} className="flex flex-col gap-2">
            {starts.has(i) ? (
              <span className="mx-auto rounded-md border border-[#e8ddd0] bg-white px-3 py-0.5 text-[12px] text-[#4a1a1a]">
                {dayChip(item.at)}
              </span>
            ) : null}
            <Bubble item={item} partner={partner} />
          </div>
        ))
      )}
    </div>
  );
}

function Bubble({
  item,
  partner,
}: {
  item: ChatItem;
  partner: { name: string; photo: string | null };
}) {
  return (
    <div className={clsx('flex items-start gap-2', item.mine ? 'justify-end' : 'justify-start')}>
      {!item.mine ? <Avatar photo={partner.photo} name={partner.name} small /> : null}
      <div
        className={clsx(
          'max-w-[78%] px-3 py-2 lg:max-w-[60%]',
          item.mine
            ? 'rounded-xl rounded-tr-[4px] bg-[#720A0B] text-white'
            : 'rounded-xl rounded-tl-[4px] border border-[#BE7B71] bg-[#F8F3DF] text-[#1f1a17]',
        )}
      >
        {item.image ? (
          <a href={item.image} target="_blank" rel="noopener noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element -- chat images are backend media URLs */}
            <img
              src={item.image}
              alt="Photo"
              className="max-h-[250px] w-[200px] rounded-lg object-cover"
            />
          </a>
        ) : null}
        {item.text ? (
          <p className="whitespace-pre-wrap break-words text-[15px] font-medium leading-snug lg:text-[16px]">
            {item.text}
          </p>
        ) : null}
        <p
          className={clsx(
            'mt-1 text-right text-[11px]',
            item.mine ? 'text-white/85' : 'text-[#720A0B]',
          )}
        >
          {messageTime(item.at)}
        </p>
      </div>
    </div>
  );
}
