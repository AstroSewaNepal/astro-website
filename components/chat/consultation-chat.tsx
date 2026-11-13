'use client';

import {
  useCallback,
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
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  BadgeCheck,
  Ban,
  ChevronLeft,
  Clock3,
  Copy,
  EllipsisVertical,
  Flag,
  ImageOff,
  ImagePlus,
  Loader2,
  SendHorizontal,
  UserRound,
  WifiOff,
  X,
} from 'lucide-react';
import clsx from 'clsx';

import { ConfirmDialog } from '@/components/account/confirm-dialog';
import { ReviewDialog } from '@/components/booking/review-dialog';
import css from '@/components/chat/chat.module.css';
import { ImageViewer, useImageViewer } from '@/components/chat/image-viewer';
import { BlockDialog } from '@/components/moderation/block-dialog';
import { ReportDialog } from '@/components/moderation/report-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useChatLive } from '@/hooks/use-chat-live';
import { useLongPress } from '@/hooks/use-long-press';
import { usePhoneFullScreen } from '@/hooks/use-phone-full-screen';
import { CallIcon, VideoCallIcon } from '@/components/call/call-icons';
import { useCalls } from '@/components/call/call-provider';
import { settingsPaths } from '@/lib/account/settings';
import { consultationsPath } from '@/lib/booking/consultations';
import { CHAT_IMAGE_ACCEPT } from '@/lib/chat/image';
import { timeline } from '@/lib/chat/live';
import {
  countdownTone,
  formatCountdown,
  msUntilNextPhase,
  notAvailableText,
  secondsLeft,
  sessionPhase,
} from '@/lib/chat/session';
import type { ChatStatus } from '@/lib/chat/socket';
import {
  callBubbleText,
  chatPartner,
  dayChip,
  dayStarts,
  hasOlderPage,
  historyItems,
  messagesPath,
  messageTime,
  type ChatBooking,
  type ChatCallInfo,
  type ChatItem,
  type ChatMessagesPage,
} from '@/lib/chat/messages';
import { BLOCKED_CHAT_TEXT, BLOCKED_IDS_KEY, type ReportTarget } from '@/lib/moderation';

const TOS_KEY = 'chatTosAndPrivacyAccepted';
/** Load older messages once the reader scrolls this close to the top. */
const OLDER_THRESHOLD_PX = 80;
/** A reader this close to the bottom follows new messages; further up, they keep their place. */
const NEAR_BOTTOM_PX = 120;
/** Only show "Connecting…" when it lasts, so a quick reconnect doesn't flash a banner. */
const STATUS_BANNER_DELAY_MS = 2_000;
/** The composer grows with the text up to about five lines, then scrolls. */
const COMPOSER_MAX_PX = 128;
/** The app re-reads the booking this often during the session for the other person's Online/Offline. */
const ONLINE_POLL_MS = 10_000;
const menuItemClass =
  'gap-2 text-[15px] font-semibold text-[#611508] focus:bg-[#efe4d2] focus:text-[#611508]';
/** Menus over the full-screen phone chat (z-55; the shared menu sits at z-50). Rendered outside the page, so they
 * need the app font themselves. */
const menuContentClass = 'z-[60] min-w-40 border-[#e8ddd0] bg-[#F8F3DF] p-2 font-app';
/** How long a note about a photo that can't be sent stays above the composer. */
const NOTICE_MS = 6_000;

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
    // Online/Offline and an end by the other side show up through this (the app's ChatOnlineStatus).
    refetchInterval: q =>
      q.state.data && sessionPhase(q.state.data, Date.now()) === 'active' ? ONLINE_POLL_MS : false,
  });
  const chatId = booking.data?.chatId ?? null;

  // The phase only changes at the start and end times (or when the booking's status changes): re-render then, not
  // every second (SessionTimer ticks on its own).
  const [now, setNow] = useState(() => Date.now());
  const phase = booking.data ? sessionPhase(booking.data, now) : null;
  useEffect(() => {
    if (!booking.data) return;
    const wait = msUntilNextPhase(booking.data, now);
    if (wait === null) return;
    const t = setTimeout(() => setNow(Date.now()), wait + 50);
    return () => clearTimeout(t);
  }, [booking.data, now]);

  // Like the app (wasActiveOnMount): a chat that was open during the session stays readable after it ends; one
  // opened before or after its time shows "Chat Not Available" instead.
  const [seenActive, setSeenActive] = useState(false);
  if (phase === 'active' && !seenActive) setSeenActive(true);
  const showChat = phase === 'active' || (phase === 'ended' && seenActive);
  const notAvailable = !!booking.data && phase !== null && !showChat;

  const history = useInfiniteQuery({
    queryKey: ['chat', 'messages', chatId],
    queryFn: ({ pageParam }) =>
      backend.bare.get<ChatMessagesPage>(messagesPath(chatId!, pageParam)),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (hasOlderPage(last) ? all.length + 1 : undefined),
    enabled: !!chatId && showChat,
  });

  // The astrologer ended it (chat_ended from someone else): the review says so, like the app.
  const [endedByPartner, setEndedByPartner] = useState(false);
  const onEnded = useCallback(
    (endedBy: string | null) => {
      if (endedBy && endedBy !== myId) setEndedByPartner(true);
    },
    [myId],
  );
  const chat = useChatLive({ chatId, myId, bookingId, enabled: phase === 'active', onEnded });
  const past = useMemo(() => historyItems(history.data?.pages ?? [], myId), [history.data, myId]);
  const items = useMemo(() => timeline(past, chat.live), [past, chat.live]);
  const partner = chatPartner(booking.data);
  const viewer = useImageViewer();

  // Report and block (the app's chat menu and message long-press). The backend refuses messages either way once one
  // side has blocked the other, so a blocked chat shows why instead of a composer that can only fail.
  const astrologerId = booking.data?.astrologerId ?? null;
  const blockedIds = useQuery({
    queryKey: BLOCKED_IDS_KEY,
    queryFn: () => backend.get<string[]>('/blocks/ids'),
    enabled: !!astrologerId,
    staleTime: 60_000,
  });
  const [blockedHere, setBlockedHere] = useState(false);
  const blocked =
    blockedHere ||
    (!!astrologerId && Array.isArray(blockedIds.data) && blockedIds.data.includes(astrologerId));
  const [report, setReport] = useState<{ title: string; target: ReportTarget } | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const reportMessage = useCallback(
    (item: ChatItem) => {
      if (!astrologerId) return;
      setReport({
        title: 'Report message',
        target: {
          targetType: 'CHAT_MESSAGE',
          targetId: item.id,
          reportedUserId: astrologerId,
          contentSnapshot: item.text || undefined,
          chatId: chatId ?? undefined,
        },
      });
    },
    [astrologerId, chatId],
  );

  // Ending the session (the app's openPostEndUI): End Chat, the timer running out, or the other side ending it all
  // leave the booking COMPLETED and open the review.
  const queryClient = useQueryClient();
  const endSession = useMutation({
    mutationFn: () => backend.patch(`/connection-schedule/${encodeURIComponent(bookingId)}/end`),
    // Idempotent on the backend; either way the booking and My Consultations are re-read.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'booking', bookingId] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [endRequested, setEndRequested] = useState(false);
  const [review, setReview] = useState<'pending' | 'closed' | 'done'>('pending');
  const sessionOver = endRequested || (phase === 'ended' && seenActive);
  // The clock ran out while the chat was open and nobody pressed End: end it on the backend too (the app does).
  const needsEnd = phase === 'ended' && seenActive && booking.data?.status === 'CONFIRMED';
  const { mutate: endNow, isIdle: endIdle } = endSession;
  useEffect(() => {
    if (needsEnd && endIdle) endNow();
  }, [needsEnd, endIdle, endNow]);
  const reviewOpen =
    sessionOver && review === 'pending' && !!booking.data && !booking.data.reviewId;
  const confirmEndChat = () => {
    setConfirmEnd(false);
    setEndRequested(true);
    endSession.mutate();
  };

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

  // Voice and video calls (the app's chat header buttons), during the session only.
  const {
    openCall,
    busy: callBusy,
    activeBookingId: callBookingId,
    registerDock,
    chatShown,
  } = useCalls();
  // While this page is up it ends the session and asks for the review itself when the time runs out mid-call.
  useEffect(() => chatShown(bookingId), [chatShown, bookingId]);
  const callHere = callBookingId === bookingId;
  // Hidden while this booking's call is open: the call is on screen, and the name gets the room.
  const canCall = phase === 'active' && !sessionOver && !blocked && !!booking.data && !callHere;
  const startCall = (callType: 'audio' | 'video') => {
    if (!booking.data) return;
    openCall({
      bookingId,
      callType,
      partner: { name: partner.name, photo: partner.photo },
      endsAt: new Date(booking.data.scheduledEndAt).getTime(),
      astrologerId: booking.data.astrologerId,
    });
  };
  // A call message's Join: this booking's call, still open, while no call is open in this tab (one chat holds the
  // messages of every booking with the astrologer, so an older booking's call never offers it).
  const canJoinCall = (call: ChatCallInfo) =>
    canCall && !callBusy && call.status !== 'ended' && call.bookingId === bookingId;

  // Phones: full screen above the keyboard, like the app's chat screen (no site header, footer or tabs).
  const panel = useRef<HTMLElement>(null);
  usePhoneFullScreen(panel);

  const failed = booking.isError || history.isError || (booking.isSuccess && !chatId);
  const loading = booking.isPending || (!!chatId && showChat && history.isPending);
  const ready = !loading && !failed;

  return (
    // Desktop with this booking's call open: the call on the left (in the empty slot handed to the call layer), the
    // chat narrower on the right (Figma desktop call). The wrapper is always there so the chat never remounts.
    <div className={clsx(callHere && 'lg:flex lg:gap-4')}>
      {callHere ? (
        <div
          ref={registerDock}
          aria-hidden
          className="hidden lg:block lg:h-[calc(100dvh-8.15rem)] lg:min-h-[420px] lg:min-w-0 lg:flex-1"
        />
      ) : null}
      {/* Phones: fixed over the whole screen (usePhoneFullScreen sizes it to the space above the keyboard). Desktop:
          fills the window below the site header and back link, 16px above its bottom edge. */}
      <section
        ref={panel}
        aria-label={`Chat with ${partner.name}`}
        className={clsx(
          'fixed inset-0 z-[55] flex flex-col overflow-hidden bg-[#F8F3DF] lg:static lg:z-auto lg:h-[calc(100dvh-8.15rem)] lg:min-h-[420px] lg:rounded-2xl lg:border lg:border-[#e8ddd0] lg:shadow-[0_4px_16px_rgba(92,56,23,0.08)]',
          callHere && 'lg:w-[360px] lg:shrink-0 xl:w-[420px]',
        )}
      >
        <header className="flex items-center gap-3 border-b border-[#e8ddd0] bg-[#F8F3DF] px-4 py-3 max-lg:pl-1 max-lg:pt-[max(0.75rem,env(safe-area-inset-top))] lg:pl-3 lg:pr-6">
          {/* The chat's own back: phones cover the site's back link, and desktop leaves it out for a taller panel. */}
          <Link
            href={consultationsPath()}
            aria-label="Back to My Consultations"
            className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg text-[#611508] lg:w-9 lg:hover:bg-[#efe4d2]"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </Link>
          <Avatar photo={partner.photo} name={partner.name} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[17px] font-semibold text-[#611508] lg:text-[19px]">
              <span className="truncate">{booking.isPending ? 'Loading…' : partner.name}</span>
              {booking.data && !booking.data.astrologer?.isPendingDeletion ? (
                <BadgeCheck className="h-4 w-4 shrink-0 text-[#720A0B]" aria-label="Verified" />
              ) : null}
            </p>
            {showChat && booking.data ? (
              <p className="mt-0.5 flex items-center gap-3 text-[14px] lg:text-[15px]">
                <span
                  className={clsx(
                    'font-medium',
                    booking.data.astrologerIsSocketConnected ? 'text-[#15B763]' : 'text-[#FF3B3B]',
                  )}
                >
                  {booking.data.astrologerIsSocketConnected ? 'Online' : 'Offline'}
                </span>
                <SessionTimer endAt={booking.data.scheduledEndAt} ended={phase === 'ended'} />
              </p>
            ) : null}
          </div>
          {canCall ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => startCall('audio')}
                disabled={callBusy}
                aria-label="Voice call"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#720A0B] hover:bg-[#efe4d2] disabled:text-[#B6ACA6] focus-visible:outline-2 focus-visible:outline-[#611508]"
              >
                <CallIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => startCall('video')}
                disabled={callBusy}
                aria-label="Video call"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#720A0B] hover:bg-[#efe4d2] disabled:text-[#B6ACA6] focus-visible:outline-2 focus-visible:outline-[#611508]"
              >
                <VideoCallIcon className="h-6 w-6" />
              </button>
            </div>
          ) : null}
          {astrologerId ? (
            // Not modal: a modal menu that opens a dialog can leave the page unclickable (Radix).
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                aria-label="Chat options"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#611508] hover:bg-[#efe4d2] focus-visible:outline-2 focus-visible:outline-[#611508]"
              >
                <EllipsisVertical className="h-5 w-5" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={menuContentClass}>
                {phase === 'active' && !endRequested ? (
                  <DropdownMenuItem onSelect={() => setConfirmEnd(true)} className={menuItemClass}>
                    <X className="h-4 w-4 text-[#611508]" aria-hidden />
                    End Chat
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onSelect={() =>
                    setReport({
                      title: 'Report astrologer',
                      target: {
                        targetType: 'ASTROLOGER',
                        targetId: astrologerId,
                        reportedUserId: astrologerId,
                        chatId: chatId ?? undefined,
                      },
                    })
                  }
                  className={menuItemClass}
                >
                  <Flag className="h-4 w-4 text-[#611508]" aria-hidden />
                  Report
                </DropdownMenuItem>
                {!blocked ? (
                  <DropdownMenuItem
                    onSelect={() => setConfirmBlock(true)}
                    className={menuItemClass}
                  >
                    <Ban className="h-4 w-4 text-[#611508]" aria-hidden />
                    Block
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </header>

        {notAvailable && booking.data ? (
          // Same paper as the message area (the app's chat screen keeps its background here too).
          <div
            className={clsx(
              css.messages,
              'flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center',
            )}
          >
            <Clock3 className="h-16 w-16 text-[#611508]" strokeWidth={1.5} aria-hidden />
            <h2 className="text-[22px] font-semibold text-[#611508]">Chat Not Available</h2>
            <p className="max-w-md text-[16px] text-[#3b3b3b]">{notAvailableText(booking.data)}</p>
          </div>
        ) : null}

        {!notAvailable && !tosAccepted ? (
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

        {ready && phase === 'active' ? (
          <ConnectionBanner status={chat.status} onRetry={chat.reconnect} />
        ) : null}

        {notAvailable ? null : loading ? (
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
            onOpenImage={viewer.open}
            onReport={astrologerId ? reportMessage : undefined}
            canJoinCall={canJoinCall}
            onJoinCall={startCall}
          />
        )}

        {notAvailable ? null : phase === 'ended' ? (
          <div
            role="status"
            className="flex flex-col items-center gap-1.5 border-t border-[#e8ddd0] bg-[#efe4d2] px-4 py-3 text-center text-[15px]"
          >
            {review === 'done' ? (
              <p className="text-[#1f4d23]">
                <b>Thank you!</b> Your rating has been submitted successfully.
              </p>
            ) : (
              <p className="font-medium text-[#611508]">This consultation has ended.</p>
            )}
            <div className="flex gap-5 text-[14px] font-semibold text-[#720A0B]">
              {review === 'closed' &&
              booking.data?.status === 'COMPLETED' &&
              !booking.data.reviewId ? (
                <button
                  type="button"
                  onClick={() => setReview('pending')}
                  className="hover:underline"
                >
                  Leave a Review
                </button>
              ) : null}
              <Link href={consultationsPath('completed')} className="hover:underline">
                My Consultations
              </Link>
            </div>
          </div>
        ) : blocked ? (
          <div
            role="status"
            className="flex flex-col items-center gap-1.5 border-t border-[#e8ddd0] bg-[#efe4d2] px-4 py-3 text-center text-[15px] max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <p className="font-medium text-[#611508]">
              {blockedHere ? `You blocked ${partner.name}. ` : ''}
              {BLOCKED_CHAT_TEXT}
            </p>
            <Link
              href={settingsPaths('client').blockedUsers}
              className="text-[14px] font-semibold text-[#720A0B] hover:underline"
            >
              Blocked users
            </Link>
          </div>
        ) : (
          <Composer
            disabled={!ready}
            onSend={chat.send}
            onSendImage={chat.sendImage}
            onTyped={chat.typed}
            onStopTyping={chat.stopTyping}
          />
        )}

        <ConfirmDialog
          open={confirmEnd}
          onOpenChange={setConfirmEnd}
          title="Are you sure you want to end the chat?"
          confirmText="Yes"
          cancelText="No"
          onConfirm={confirmEndChat}
        />
        <ImageViewer src={viewer.src} onClose={viewer.close} />
        {report ? (
          <ReportDialog
            title={report.title}
            target={report.target}
            onClose={() => setReport(null)}
          />
        ) : null}
        {astrologerId ? (
          <BlockDialog
            user={{ id: astrologerId, name: partner.name }}
            open={confirmBlock}
            onOpenChange={setConfirmBlock}
            onBlocked={() => setBlockedHere(true)}
          />
        ) : null}
        {reviewOpen && booking.data ? (
          <ReviewDialog
            astrologerId={booking.data.astrologerId}
            bookingId={bookingId}
            astrologerName={partner.name}
            photo={partner.photo}
            note={endedByPartner ? `Your chat has been ended by ${partner.name}.` : undefined}
            waiting={endSession.isPending}
            onClose={() => setReview('closed')}
            onDone={() => setReview('done')}
          />
        ) : null}
      </section>
    </div>
  );
}

/** Time left in the session, ticking every second (the app's ChatTimer). */
function SessionTimer({ endAt, ended }: { endAt: string; ended: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(t);
  }, [ended]);
  const left = ended ? 0 : secondsLeft(endAt, now);
  const tone = countdownTone(left);
  return (
    <span
      role="timer"
      aria-label={`${formatCountdown(left)} left`}
      className={clsx(
        'flex items-center gap-1 tabular-nums',
        // The app's #FFBB50 amber is unreadable on the cream header: a darker amber instead.
        tone === 'calm' && 'font-medium text-[#15B763]',
        tone === 'soon' && 'font-bold text-[#B87400]',
        tone === 'urgent' && 'font-bold text-[#C00303]',
      )}
    >
      <Clock3 className="h-4 w-4 text-[#611508]" aria-hidden />
      {formatCountdown(left)}
    </span>
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
  onSendImage,
  onTyped,
  onStopTyping,
}: {
  disabled: boolean;
  onSend: (text: string) => boolean;
  /** Returns why the photo can't be sent, or null once it's on its way. */
  onSendImage: (file: File) => string | null;
  onTyped: () => void;
  onStopTyping: () => void;
}) {
  const [text, setText] = useState('');
  const field = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(t);
  }, [notice]);

  // One photo per pick (the app's picker): phones offer the camera or the gallery from the same button.
  const onPicked = (input: HTMLInputElement) => {
    const file = input.files?.[0];
    // Cleared so picking the same photo again still fires a change.
    input.value = '';
    if (!file || disabled) return;
    setNotice(onSendImage(file));
  };

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
      className="relative flex items-end gap-2 border-t border-[#e8ddd0] bg-[#F8F3DF] px-3 py-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-5"
    >
      {notice ? (
        <p
          role="alert"
          className="absolute inset-x-3 bottom-full mb-2 rounded-lg bg-[#fbe9e7] px-3 py-2 text-[13px] text-[#8a1c12] shadow-sm lg:inset-x-5"
        >
          {notice}
        </p>
      ) : null}
      <input
        ref={picker}
        type="file"
        accept={CHAT_IMAGE_ACCEPT}
        hidden
        tabIndex={-1}
        onChange={e => onPicked(e.currentTarget)}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => picker.current?.click()}
        aria-label="Send a photo"
        className="flex h-11 w-9 shrink-0 items-center justify-center rounded-full text-[#720A0B] hover:bg-[#efe4d2] focus-visible:outline-2 focus-visible:outline-[#720A0B] disabled:opacity-50"
      >
        <ImagePlus className="h-6 w-6" aria-hidden />
      </button>
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
  onOpenImage,
  onReport,
  canJoinCall,
  onJoinCall,
}: {
  items: ChatItem[];
  partner: { name: string; photo: string | null };
  partnerTyping: boolean;
  loadingOlder: boolean;
  canLoadOlder: boolean;
  loadOlder: () => void;
  onRetry: (item: ChatItem) => void;
  onDiscard: (item: ChatItem) => void;
  onOpenImage: (url: string) => void;
  /** Report one of the other person's messages; missing while the booking isn't known. */
  onReport?: (item: ChatItem) => void;
  canJoinCall: (call: ChatCallInfo) => boolean;
  onJoinCall: (callType: ChatCallInfo['callType']) => void;
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
      // Touching the messages (tap or drag) puts the keyboard away, like iMessage/WhatsApp: iPhones have no back
      // button, and Send keeps the keyboard up for the next message. Mouse clicks keep the focus.
      onPointerDown={e => {
        const active = document.activeElement;
        if (e.pointerType !== 'mouse' && active instanceof HTMLTextAreaElement) active.blur();
      }}
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
            <Bubble
              item={item}
              partner={partner}
              onRetry={onRetry}
              onDiscard={onDiscard}
              onOpenImage={onOpenImage}
              onReport={onReport}
              canJoinCall={canJoinCall}
              onJoinCall={onJoinCall}
            />
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
  onOpenImage,
  onReport,
  canJoinCall,
  onJoinCall,
}: {
  item: ChatItem;
  partner: { name: string; photo: string | null };
  onRetry: (item: ChatItem) => void;
  onDiscard: (item: ChatItem) => void;
  onOpenImage: (url: string) => void;
  onReport?: (item: ChatItem) => void;
  canJoinCall: (call: ChatCallInfo) => boolean;
  onJoinCall: (callType: ChatCallInfo['callType']) => void;
}) {
  const failed = item.status === 'failed';
  // The other person's messages have actions (copy, report): a hover button on computers, a long press on touch
  // screens (the app's long-press report). Call messages are written by the server: nothing to copy or report.
  const hasActions = !item.mine && !item.status && !!onReport && !item.call;
  const [menuOpen, setMenuOpen] = useState(false);
  const press = useLongPress(() => setMenuOpen(true), hasActions);
  return (
    <div
      className={clsx('group flex items-start gap-2', item.mine ? 'justify-end' : 'justify-start')}
    >
      {!item.mine ? <Avatar photo={partner.photo} name={partner.name} small /> : null}
      <div className={clsx('flex max-w-[78%] flex-col lg:max-w-[60%]', item.mine && 'items-end')}>
        <div
          {...press}
          className={clsx(
            // Touch: a long press opens the actions instead of selecting text (Copy is in the menu).
            hasActions && '[-webkit-touch-callout:none] [@media(pointer:coarse)]:select-none',
            'px-3 py-2',
            item.mine
              ? 'rounded-xl rounded-tr-[4px] bg-[#720A0B] text-white'
              : 'rounded-xl rounded-tl-[4px] border border-[#BE7B71] bg-[#F8F3DF] text-[#1f1a17]',
            item.status === 'sending' && 'opacity-80',
            failed && 'opacity-60',
          )}
        >
          {item.call ? (
            <CallMessage
              call={item.call}
              mine={item.mine}
              partnerName={partner.name}
              canJoin={canJoinCall(item.call)}
              onJoin={onJoinCall}
            />
          ) : /* A photo whose URL was refused (lib/chat/messages.ts safeImageUrl) still shows as a photo that won't load. */
          item.image || item.mediaId ? (
            <ChatPhoto
              src={item.image}
              fallback={item.fullImage ?? null}
              pending={!!item.status}
              sending={item.status === 'sending'}
              onOpen={onOpenImage}
            />
          ) : null}
          {item.text && !item.call ? (
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
      {hasActions ? (
        <DropdownMenu modal={false} open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger
            aria-label="Message options"
            // Shown on hover with a mouse; on touch screens it only anchors the long-press menu.
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#611508] opacity-0 hover:bg-[#efe4d2] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[#611508] group-hover:opacity-100 data-[state=open]:opacity-100 [@media(pointer:coarse)]:pointer-events-none"
          >
            <EllipsisVertical className="h-4 w-4" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={menuContentClass}
            // Lifting the finger after a long press on a photo focuses its button, which would close the menu at once.
            // A tap elsewhere still closes it.
            onFocusOutside={e => e.preventDefault()}
          >
            {item.text ? (
              <DropdownMenuItem
                onSelect={() => void navigator.clipboard?.writeText(item.text).catch(() => {})}
                className={menuItemClass}
              >
                <Copy className="h-4 w-4 text-[#611508]" aria-hidden />
                Copy text
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onSelect={() => onReport?.(item)} className={menuItemClass}>
              <Flag className="h-4 w-4 text-[#611508]" aria-hidden />
              Report message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

/**
 * A call message inside its bubble, on the side of whoever started the call: the call icon, what happened, and Join
 * while the call is open (Rejoin for the caller, who may have closed the call screen).
 */
function CallMessage({
  call,
  mine,
  partnerName,
  canJoin,
  onJoin,
}: {
  call: ChatCallInfo;
  mine: boolean;
  partnerName: string;
  canJoin: boolean;
  onJoin: (callType: ChatCallInfo['callType']) => void;
}) {
  const { title, detail, missed } = callBubbleText(call, mine, partnerName);
  const open = call.status !== 'ended';
  const Icon = call.callType === 'audio' ? CallIcon : VideoCallIcon;
  return (
    <div className="flex min-w-[200px] flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            mine
              ? 'bg-white/15 text-[#F8F3DF]'
              : missed
                ? 'bg-[#FF3B3B]/10 text-[#D92D20]'
                : open
                  ? 'bg-[#720A0B] text-white'
                  : 'bg-[#efe4d2] text-[#720A0B]',
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p
            className={clsx(
              'text-[15px] font-semibold leading-snug lg:text-[16px]',
              missed && 'text-[#D92D20]',
            )}
          >
            {title}
          </p>
          {detail ? (
            <p
              className={clsx(
                'text-[13px] leading-snug',
                mine ? 'text-white/85' : 'text-[#5c4a3d]',
                call.status === 'ongoing' && 'flex items-center gap-1.5',
              )}
            >
              {call.status === 'ongoing' ? (
                <span
                  className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#15B763]"
                  aria-hidden
                />
              ) : null}
              {detail}
            </p>
          ) : null}
        </div>
      </div>
      {canJoin ? (
        <button
          type="button"
          onClick={() => onJoin(call.callType)}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#15B763] px-5 text-[15px] font-semibold text-white hover:bg-[#12a157] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15B763]"
        >
          <Icon className="h-4 w-4" />
          {mine ? 'Rejoin' : 'Join'}
        </button>
      ) : null}
    </div>
  );
}

/**
 * A photo in a bubble, at the app's 200 x 250. The fixed box keeps the scroll position steady while photos load, and
 * lazy loading leaves photos far up the history unloaded until the reader scrolls to them.
 */
function ChatPhoto({
  src,
  fallback,
  pending,
  sending,
  onOpen,
}: {
  src: string | null;
  /** The original, tried when the WebP copy is missing. */
  fallback: string | null;
  /** Still on this device (not tappable: the full photo isn't uploaded yet). */
  pending: boolean;
  sending: boolean;
  onOpen: (url: string) => void;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const current = [src, fallback].find(u => !!u && !failed.includes(u)) ?? null;
  const box =
    'relative block h-[250px] w-[200px] max-w-full overflow-hidden rounded-lg bg-[#e8ddd0]';

  if (!current) {
    return (
      <span
        className={clsx(
          box,
          'flex flex-col items-center justify-center gap-1 text-[13px] text-[#611508]',
        )}
      >
        <ImageOff className="h-7 w-7" aria-hidden />
        Photo unavailable
      </span>
    );
  }
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- chat photos are backend media URLs (images.unoptimized)
    <img
      src={current}
      alt="Photo"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(f => [...f, current])}
      className="h-full w-full object-cover"
    />
  );
  if (pending) {
    return (
      <span className={box}>
        {img}
        {sending ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 className="h-7 w-7 animate-spin text-white" aria-label="Sending photo" />
          </span>
        ) : null}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(fallback ?? current)}
      aria-label="Open photo"
      className={clsx(
        box,
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#720A0B]',
      )}
    >
      {img}
    </button>
  );
}
