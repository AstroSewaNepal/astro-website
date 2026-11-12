'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  BadgeCheck,
  Clock3,
  Loader2,
  SendHorizontal,
  UserRound,
  WifiOff,
  X,
} from 'lucide-react';
import clsx from 'clsx';

import css from '@/components/chat/chat.module.css';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useChatLive } from '@/hooks/use-chat-live';
import { timeline } from '@/lib/chat/live';
import type { ChatStatus } from '@/lib/chat/socket';
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
/** A reader this close to the bottom follows new messages; further up, they keep their place. */
const NEAR_BOTTOM_PX = 120;
/** Only show "Connecting…" when it lasts, so a quick reconnect doesn't flash a banner. */
const STATUS_BANNER_DELAY_MS = 2_000;
/** The composer grows with the text up to about five lines, then scrolls. */
const COMPOSER_MAX_PX = 128;

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
 * chips, live messages and typing over the socket, composer.
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

  const chat = useChatLive({ chatId, myId, bookingId });
  const past = useMemo(() => historyItems(history.data?.pages ?? [], myId), [history.data, myId]);
  const items = useMemo(() => timeline(past, chat.live), [past, chat.live]);
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
  const ready = !loading && !failed;

  return (
    // Fills the window below the header and back link: phones stop 12px above the bottom tabs, desktop 16px above
    // the window's bottom edge.
    <section
      aria-label={`Chat with ${partner.name}`}
      className="flex h-[calc(100dvh-12.5rem-env(safe-area-inset-bottom))] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#e8ddd0] bg-[#F8F3DF] shadow-[0_4px_16px_rgba(92,56,23,0.08)] lg:h-[calc(100dvh-10.5rem)]"
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

      {ready ? <ConnectionBanner status={chat.status} onRetry={chat.reconnect} /> : null}

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
          partnerTyping={chat.partnerTyping}
          loadingOlder={history.isFetchingNextPage}
          canLoadOlder={!!history.hasNextPage}
          loadOlder={() => history.fetchNextPage()}
          onRetry={chat.retry}
          onDiscard={chat.discard}
        />
      )}

      <Composer
        disabled={!ready}
        onSend={chat.send}
        onTyped={chat.typed}
        onStopTyping={chat.stopTyping}
      />
    </section>
  );
}

/** Shown only while the socket is down for a while; messages still queue and go out once it's back. */
function ConnectionBanner({ status, onRetry }: { status: ChatStatus; onRetry: () => void }) {
  const [slow, setSlow] = useState(false);
  const down = status !== 'online';
  useEffect(() => {
    if (!down) return;
    const t = setTimeout(() => setSlow(true), STATUS_BANNER_DELAY_MS);
    return () => {
      clearTimeout(t);
      setSlow(false);
    };
  }, [down]);

  if (status === 'failed') {
    return (
      <div
        role="status"
        className="flex items-center gap-2 bg-[#fbe9e7] px-4 py-2 text-[13px] text-[#8a1c12] lg:px-6 lg:text-[14px]"
      >
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
        <p className="flex-1">Chat is offline. New messages won&apos;t arrive.</p>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-full border border-[#8a1c12] px-3 py-0.5 font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }
  if (!down || !slow) return null;
  return (
    <div
      role="status"
      className="flex items-center gap-2 bg-[#efe4d2] px-4 py-2 text-[13px] text-[#611508] lg:px-6 lg:text-[14px]"
    >
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      <p>{status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…'}</p>
    </div>
  );
}

/** Enter sends on a keyboard-and-mouse computer; on touch screens Enter is a new line and the button sends. */
function enterSends(): boolean {
  try {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  } catch {
    return true;
  }
}

function Composer({
  disabled,
  onSend,
  onTyped,
  onStopTyping,
}: {
  disabled: boolean;
  onSend: (text: string) => boolean;
  onTyped: () => void;
  onStopTyping: () => void;
}) {
  const [text, setText] = useState('');
  const field = useRef<HTMLTextAreaElement>(null);

  // Grows with its text; shrinks back after sending.
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = 'auto';
    // scrollHeight leaves out the border; without it the field overflows by 2px and shows a scrollbar.
    const full = el.scrollHeight + (el.offsetHeight - el.clientHeight);
    el.style.height = `${Math.min(full, COMPOSER_MAX_PX)}px`;
    el.style.overflowY = full > COMPOSER_MAX_PX ? 'auto' : 'hidden';
  }, [text]);

  const submit = () => {
    if (disabled || !onSend(text)) return;
    setText('');
    field.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing || !enterSends()) return;
    e.preventDefault();
    submit();
  };

  const canSend = !disabled && !!text.trim();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 border-t border-[#e8ddd0] bg-[#F8F3DF] px-3 py-3 lg:px-5"
    >
      <textarea
        ref={field}
        rows={1}
        value={text}
        disabled={disabled}
        onChange={e => {
          setText(e.target.value);
          if (e.target.value.trim()) onTyped();
          else onStopTyping();
        }}
        onKeyDown={onKeyDown}
        placeholder="Write message..."
        aria-label="Message"
        className="min-w-0 flex-1 resize-none rounded-3xl border border-[#720A0B] bg-[#F8F3DF] px-4 py-2.5 text-[16px] leading-6 text-[#1f1a17] outline-none placeholder:text-[#8a7a6a] focus-visible:ring-2 focus-visible:ring-[#720A0B]/30 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send"
        // Keeps the phone keyboard open: tapping the button would otherwise blur the field first.
        onPointerDown={e => e.preventDefault()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#720A0B] text-white disabled:opacity-50"
      >
        <SendHorizontal className="h-5 w-5" aria-hidden />
      </button>
    </form>
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

type ScrollSnapshot = {
  height: number;
  top: number;
  client: number;
  first: string | null;
  last: string | null;
};

const nearBottom = (s: ScrollSnapshot) => s.height - s.top - s.client < NEAR_BOTTOM_PX;

function MessageList({
  items,
  partner,
  partnerTyping,
  loadingOlder,
  canLoadOlder,
  loadOlder,
  onRetry,
  onDiscard,
}: {
  items: ChatItem[];
  partner: { name: string; photo: string | null };
  partnerTyping: boolean;
  loadingOlder: boolean;
  canLoadOlder: boolean;
  loadOlder: () => void;
  onRetry: (item: ChatItem) => void;
  onDiscard: (item: ChatItem) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const starts = useMemo(() => dayStarts(items), [items]);
  // Starts at the newest message, keeps the reader's place when older messages are added above, and follows new
  // ones at the bottom when the reader is there (or just sent one).
  const before = useRef<ScrollSnapshot | null>(null);
  const snapshot = (el: HTMLDivElement): ScrollSnapshot => ({
    height: el.scrollHeight,
    top: el.scrollTop,
    client: el.clientHeight,
    first: items[0]?.id ?? null,
    last: items.at(-1)?.id ?? null,
  });

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const prev = before.current;
    const first = items[0]?.id ?? null;
    const lastItem = items.at(-1);
    if (!prev) el.scrollTop = el.scrollHeight;
    else if (prev.first !== first && prev.last === (lastItem?.id ?? null))
      el.scrollTop = prev.top + (el.scrollHeight - prev.height);
    else if (nearBottom(prev) || (prev.last !== (lastItem?.id ?? null) && lastItem?.mine))
      el.scrollTop = el.scrollHeight;
    before.current = snapshot(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot reads the same items
  }, [items, partnerTyping]);

  // The composer growing (or the window/keyboard resizing) shrinks the list: stay at the bottom if already there.
  useEffect(() => {
    const el = scroller.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      const prev = before.current;
      if (!prev) return;
      if (nearBottom(prev)) el.scrollTop = el.scrollHeight;
      before.current = {
        ...prev,
        height: el.scrollHeight,
        top: el.scrollTop,
        client: el.clientHeight,
      };
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    if (before.current)
      before.current = {
        ...before.current,
        height: el.scrollHeight,
        top: el.scrollTop,
        client: el.clientHeight,
      };
    if (el.scrollTop < OLDER_THRESHOLD_PX && canLoadOlder && !loadingOlder) loadOlder();
  };

  return (
    <div
      ref={scroller}
      onScroll={onScroll}
      className={clsx(css.messages, 'flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 lg:px-6')}
      aria-live="polite"
    >
      {loadingOlder ? (
        <Loader2
          className="mx-auto h-5 w-5 shrink-0 animate-spin text-[#611508]"
          aria-label="Loading older messages"
        />
      ) : null}
      {items.length === 0 && !partnerTyping ? (
        <p className="m-auto text-center text-[15px] text-[#8a7a6a]">No messages yet.</p>
      ) : (
        items.map((item, i) => (
          <div key={item.id} className="flex flex-col gap-2">
            {starts.has(i) ? (
              <span className="mx-auto rounded-md border border-[#e8ddd0] bg-white px-3 py-0.5 text-[12px] text-[#4a1a1a]">
                {dayChip(item.at)}
              </span>
            ) : null}
            <Bubble item={item} partner={partner} onRetry={onRetry} onDiscard={onDiscard} />
          </div>
        ))
      )}
      {partnerTyping ? <TypingBubble partner={partner} /> : null}
    </div>
  );
}

/** The other person is typing: three dots in a received bubble (the app's GiftedChat indicator). */
function TypingBubble({ partner }: { partner: { name: string; photo: string | null } }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar photo={partner.photo} name={partner.name} small />
      <div className="flex items-center gap-1 rounded-xl rounded-tl-[4px] border border-[#BE7B71] bg-[#F8F3DF] px-3.5 py-3">
        <span className="sr-only">{partner.name} is typing</span>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            aria-hidden
            className={clsx(css.typingDot, 'h-1.5 w-1.5 rounded-full bg-[#720A0B]')}
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function Bubble({
  item,
  partner,
  onRetry,
  onDiscard,
}: {
  item: ChatItem;
  partner: { name: string; photo: string | null };
  onRetry: (item: ChatItem) => void;
  onDiscard: (item: ChatItem) => void;
}) {
  const failed = item.status === 'failed';
  return (
    <div className={clsx('flex items-start gap-2', item.mine ? 'justify-end' : 'justify-start')}>
      {!item.mine ? <Avatar photo={partner.photo} name={partner.name} small /> : null}
      <div className={clsx('flex max-w-[78%] flex-col lg:max-w-[60%]', item.mine && 'items-end')}>
        <div
          className={clsx(
            'px-3 py-2',
            item.mine
              ? 'rounded-xl rounded-tr-[4px] bg-[#720A0B] text-white'
              : 'rounded-xl rounded-tl-[4px] border border-[#BE7B71] bg-[#F8F3DF] text-[#1f1a17]',
            item.status === 'sending' && 'opacity-80',
            failed && 'opacity-60',
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
              'mt-1 flex items-center justify-end gap-1 text-[11px]',
              item.mine ? 'text-white/85' : 'text-[#720A0B]',
            )}
          >
            {item.status === 'sending' ? (
              <>
                <Clock3 className="h-3 w-3" aria-hidden />
                <span>Sending…</span>
              </>
            ) : failed ? (
              <>
                <AlertCircle className="h-3 w-3" aria-hidden />
                <span>Not sent</span>
              </>
            ) : (
              messageTime(item.at)
            )}
          </p>
        </div>
        {failed ? (
          <div className="mt-1 flex flex-col items-end gap-0.5 text-right text-[12px]">
            {item.error ? <p className="text-[#8a1c12]">{item.error}</p> : null}
            <div className="flex gap-3 font-semibold text-[#720A0B]">
              <button type="button" onClick={() => onRetry(item)} className="hover:underline">
                Retry
              </button>
              <button type="button" onClick={() => onDiscard(item)} className="hover:underline">
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
