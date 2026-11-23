'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Check, ChevronDown, ChevronUp, Gift, Heart, Loader2, Lock, Phone, Share2, Volume2, X } from 'lucide-react';

import { ReviewDialog } from '@/components/booking/review-dialog';
import { useCalls } from '@/components/call/call-provider';
import { LiveCallSheet } from '@/components/live/live-call-sheet';
import { LiveChatFeed, LiveComposer } from '@/components/live/live-chat';
import { LiveGiftFloats } from '@/components/live/live-gift-floats';
import { LiveGiftSheet } from '@/components/live/live-gift-sheet';
import { LIVE_ROOMS_KEY } from '@/components/live/live-feed';
import {
  LiveCallControls,
  LiveEndCallDialog,
  LiveResumeCall,
  LiveTurnDialog,
  useLiveCallGuards,
} from '@/components/live/live-my-call';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import { useLiveCallStandby } from '@/hooks/use-live-call-standby';
import { useLiveSession } from '@/hooks/use-live-session';
import { usePhoneFullScreen } from '@/hooks/use-phone-full-screen';
import { liveApi, type LiveRoomSummary } from '@/lib/live/api';
import {
  callDisabledReason,
  errorPlace,
  JOIN_BLOCKED_IN_CONSULTATION,
  myQueueText,
  type LiveCallResult,
} from '@/lib/live/call-slot';
import { liveGiftResult } from '@/lib/live/gifts';
import { takeLiveReturnNote } from '@/lib/live/return-note';
import { compactCount, formatCallSlotPrice, LIVE_FEED_POLL_MS, livePath, stableRooms } from '@/lib/live/feed';
import type { LiveSession, LiveState } from '@/lib/live/session';
import { callBannerText, countdownTone, feedItems, formatCountdown, neighbours, swipeDirection, type SwipePoint } from '@/lib/live/ui';

type Me = { id: string; name: string };


/**
 * One astrologer's live stream (the app's LiveViewerScreen + swipe feed). Phone: full screen, the app's layout
 * (video behind, host pill on top, chat and actions over the bottom). Desktop: a Shorts-style portrait player with
 * up/down arrows and the chat beside it. Swiping or the arrows move to the next live room on the same mounted page:
 * the session changes, the video elements stay.
 */
export function LiveViewer({ astrologerId: initialId, me }: { astrologerId: string; me: Me }) {
  const router = useRouter();
  const pathname = usePathname();
  const backend = useBackendClient();
  const { countryCode } = useBuyerCountry();

  // Which stream is on. Swipes and arrows change it here and only rewrite the URL (replaceState), so this page
  // stays mounted and the video elements with it; a real navigation to another /live/<id> (a link, Back) changes
  // the path, and the state follows it.
  const fromPath = pathname?.startsWith('/live/') ? decodeURIComponent(pathname.slice('/live/'.length)) : null;
  const [astrologerId, setAstrologerId] = useState(fromPath || initialId);
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    if (fromPath) setAstrologerId(fromPath);
  }

  const rooms = useQuery({
    queryKey: LIVE_ROOMS_KEY,
    queryFn: () => liveApi(backend).activeRooms(),
    refetchInterval: LIVE_FEED_POLL_MS,
    staleTime: 10_000,
  });
  const [order, setOrder] = useState<{ source: LiveRoomSummary[] | undefined; shown: LiveRoomSummary[] }>({
    source: undefined,
    shown: [],
  });
  if (rooms.data && rooms.data !== order.source) {
    setOrder({ source: rooms.data, shown: stableRooms(order.shown, rooms.data) });
  }
  const list = order.shown;
  const room = list.find(r => r.astrologerId === astrologerId) ?? null;
  const { prev, next } = neighbours(list, astrologerId);
  // Once a stream was found it stays "this stream" until the session itself says it ended, so a poll that misses
  // the room for a moment doesn't tear the screen down.
  const [held, setHeld] = useState<LiveRoomSummary | null>(null);
  if (room && room !== held) setHeld(room);
  const current = room ?? (held?.astrologerId === astrologerId ? held : null);

  const [again, setAgain] = useState(0);
  const { session, state } = useLiveSession(
    current ? { roomId: current.roomId, roomName: current.roomName, astrologerId: current.astrologerId } : null,
    me,
    countryCode,
    again,
  );

  // My own call (step 5): while I am the caller, or joining, this stream is not left by a swipe, an arrow or a tap
  // on another room; the call has to be ended first.
  const inMyCall = state?.phase === 'in-call' || state?.phase === 'joining-call';
  useLiveCallGuards(inMyCall);

  const go = useCallback(
    (target: LiveRoomSummary | null) => {
      if (!target || inMyCall) return;
      setAstrologerId(target.astrologerId);
      window.history.replaceState(window.history.state, '', livePath(target.astrologerId));
    },
    [inMyCall],
  );

  // Arrow keys on desktop (not while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') go(next);
      if (e.key === 'ArrowUp') go(prev);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, next, prev]);

  // Swipe up/down on the video (phones): the app's vertical feed. Locked while in a call (step 5).
  const touchStart = useRef<SwipePoint | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    const t = e.changedTouches[0];
    if (!start || !t || inMyCall) return;
    const dir = swipeDirection(start, { x: t.clientX, y: t.clientY, t: Date.now() });
    if (dir === 'up') go(next);
    if (dir === 'down') go(prev);
  };

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [endCallOpen, setEndCallOpen] = useState(false);
  const askLeave = () => (state?.phase === 'in-call' ? setEndCallOpen(true) : inMyCall ? undefined : setLeaveOpen(true));
  const leave = () => {
    void session?.end();
    router.push('/live');
  };

  const ended = state?.phase === 'ended';

  // The paid call (step 4): who may book, a payment waiting for a spot, and what to say afterwards.
  const { busy: inConsultation } = useCalls();
  const [callOpen, setCallOpen] = useState(false);
  const [toast, setToast] = useState<LiveToastMessage | null>(null);
  const showToast = useCallback((next: Omit<LiveToastMessage, 'id'>) => setToast({ ...next, id: Date.now() }), []);
  const standby = useLiveCallStandby(current?.roomId ?? null, !!state?.me, () => {
    showToast({ tone: 'good', title: "You're in the queue!", text: "We'll tell you when it's your turn." });
    void session?.refreshStatus();
  });
  const disabledReason = callDisabledReason({
    queue: state?.queue ?? null,
    me: state?.me ?? null,
    awaitingSlot: !!standby,
    inConsultation,
  });
  // Changing stream closes the sheet (it belongs to the stream it was opened on).
  const [giftOpen, setGiftOpen] = useState(false);
  const [callRoom, setCallRoom] = useState(current?.roomId ?? null);
  if ((current?.roomId ?? null) !== callRoom) {
    setCallRoom(current?.roomId ?? null);
    setCallOpen(false);
    setGiftOpen(false);
  }
  // My turn (step 5): the "It's your turn" window opens by itself once per turn; "Not now" closes it and the queue
  // line opens it again while the 60 seconds run.
  const turnKey = state?.me?.status === 'called' ? `${state.me.queueId}:${state.me.turnExpiresAt}` : null;
  const [turn, setTurn] = useState<{ key: string | null; open: boolean }>({ key: null, open: false });
  if (turnKey !== turn.key) {
    setTurn({ key: turnKey, open: turnKey !== null });
    // The turn window takes over from the call and gift sheets.
    if (turnKey !== null) {
      setCallOpen(false);
      setGiftOpen(false);
    }
  }
  const setTurnOpen = useCallback((open: boolean) => setTurn(t => ({ ...t, open })), []);
  const called = turnKey !== null;
  const openCall = useCallback(() => {
    if (called) setTurnOpen(true);
    else setCallOpen(true);
  }, [called, setTurnOpen]);
  // The end-call question only makes sense during the call.
  if (endCallOpen && state?.phase !== 'in-call') setEndCallOpen(false);
  // Gifts are for viewers who are not on the call themselves (the app's rule).
  if (giftOpen && (inMyCall || ended)) setGiftOpen(false);
  const resumeShown = !!state && state.phase === 'watching' && state.resumeNeeded;
  const errorAt = errorPlace({ turnOpen: turn.open, called, resumeShown });

  // One toast at a time: a payment result here, else the session's one-off notice (your turn expired, removed...).
  // A problem that has no window of its own (the call could not be closed...) is a toast too.
  const errorToast = state?.error && errorAt === 'toast' && !ended ? state.error : null;
  const shownToast: LiveToastMessage | null =
    toast ??
    (errorToast
      ? { id: ERROR_TOAST_ID, tone: 'bad', title: errorToast, text: '' }
      : state?.notice
        ? { id: -state.notice.id, tone: 'info', title: state.notice.text, text: '' }
        : null);
  const dismissToast = useCallback(() => {
    if (toast) setToast(null);
    else if (errorToast) session?.clearError();
    else session?.clearNotice();
  }, [toast, errorToast, session]);
  const onCallResult = useCallback((r: LiveCallResult) => showToast(r), [showToast]);

  // Back from paying on eSewa or the card page (the return page sent us straight here): say how it went, and let my
  // own gift fly, which the room announced while I was away (lib/live/return-note). Once per session.
  const returnFor = useRef<LiveSession | null>(null);
  const hostName = current?.astrologerName ?? null;
  useEffect(() => {
    if (!session || !current || returnFor.current === session) return;
    returnFor.current = session;
    const note = takeLiveReturnNote(current.astrologerId);
    if (!note) return;
    // The note lives in this tab's sessionStorage, so it can only be read after mount; it is read once.
    if (note.kind === 'gift') {
      session.expectOwnGift({ giftTitle: note.giftTitle, since: note.since });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      showToast(
        note.giftTitle
          ? liveGiftResult('done', note.giftTitle, hostName ?? 'the astrologer')
          : { tone: 'good', title: 'Gift sent!', text: `Your gift was sent to ${hostName ?? 'the astrologer'}.` },
      );
    } else {
      showToast({
        tone: 'good',
        title: "You're in the queue!",
        text: `${note.position ? `You are #${note.position} in line. ` : ''}We'll tell you when it's your turn.`,
      });
    }
  }, [session, current, hostName, showToast]);
  const roomGifts = state?.gifts;
  const ownGiftFloat = state?.ownGiftFloat ?? null;
  const floatGifts = useMemo(
    () => (ownGiftFloat ? [...(roomGifts ?? []), ownGiftFloat] : (roomGifts ?? [])),
    [roomGifts, ownGiftFloat],
  );

  const root = useRef<HTMLDivElement>(null);
  usePhoneFullScreen(root);

  const notLive = rooms.isSuccess && !current;
  const others = list.filter(r => r.astrologerId !== astrologerId);

  const info = current ? (
    <div className="flex items-center gap-3">
      <Link href={`/astrologer-profile/${encodeURIComponent(current.astrologerId)}`} className="relative shrink-0" aria-label={`${current.astrologerName ?? 'Astrologer'}'s profile`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary">
          <Avatar url={current.astrologerAvatar} name={current.astrologerName ?? 'Astrologer'} size={46} />
        </span>
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded border border-white bg-primary px-1.5 font-app text-[10px] font-bold leading-[14px] text-white">
          Live
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate font-app text-[18px] font-semibold text-[#4a1a1a]">{current.astrologerName ?? 'Astrologer'}</p>
        <p className="truncate font-app text-[13px] text-[#6d6d6d]">
          {state?.queue?.price ? `${formatCallSlotPrice(state.queue.price)} / 10 min · ` : ''}
          {compactCount(state?.viewerCount ?? current.viewerCount)} watching
        </p>
      </div>
      <FollowButton astrologerId={current.astrologerId} large />
    </div>
  ) : null;

  const othersStrip = others.length ? (
    <div className="hidden lg:block">
      <p className="mb-2 font-app text-[15px] font-semibold text-[#4a1a1a]">Others live now</p>
      <ul className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {others.map(r => (
          <li key={r.roomId} className="shrink-0">
            <button
              type="button"
              onClick={() => go(r)}
              className="flex w-[220px] items-center gap-3 rounded-lg border border-[#BE7B71] bg-[#FFFAE6] p-2 text-left hover:bg-[#fff5d6]"
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                <Avatar url={r.astrologerAvatar} name={r.astrologerName ?? 'Astrologer'} size={40} />
                <span className="absolute -bottom-1.5 rounded border border-white bg-primary px-1 font-app text-[9px] font-bold leading-[12px] text-white">Live</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-app text-[15px] font-semibold text-primary">{r.astrologerName ?? 'Astrologer'}</span>
                <span className="block font-app text-[13px] text-[#1C1C1C]">{r.viewerCount} watching</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  // Desktop column height: the player and the chat column share it (video as tall as the screen allows).
  const tall = 'lg:h-[max(440px,calc(100vh-250px))]';

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[60] flex flex-col bg-black lg:static lg:z-auto lg:grid lg:h-auto lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-5 lg:bg-transparent xl:grid-cols-[minmax(0,1fr)_400px]"
    >
      {/* Left: the player (the whole screen on phones). */}
      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-none">
        <div
          className={clsx('relative flex h-full w-full flex-col overflow-hidden bg-black lg:rounded-2xl', tall)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative min-h-0 flex-1">
            <Stage session={session} state={state} room={current} me={me} />
            {state ? <LiveGiftFloats key={current?.roomId ?? 'none'} gifts={floatGifts} /> : null}

            {/* Phone: the app's header over the video. Desktop: only the call pills and the close button up there. */}
            {current ? (
              <>
                <div className="lg:hidden">
                  <LiveHeader room={current} state={state} me={me} onClose={askLeave} />
                </div>
                <div className="hidden lg:block">
                  <CallPills state={state} me={me} name={current.astrologerName ?? 'Astrologer'} onClose={askLeave} />
                </div>
              </>
            ) : null}

            {/* Desktop: up/down at the video's right edge (arrow keys work too). */}
            <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
              <ArrowButton label="Previous stream" disabled={!prev || inMyCall} onClick={() => go(prev)}>
                <ChevronUp className="h-6 w-6" aria-hidden />
              </ArrowButton>
              <ArrowButton label="Next stream" disabled={!next || inMyCall} onClick={() => go(next)}>
                <ChevronDown className="h-6 w-6" aria-hidden />
              </ArrowButton>
            </div>
          </div>

          {/* Phone: chat feed left, actions right, composer along the bottom (over the video). */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
            <div className="flex items-end gap-2">
              <div className="pointer-events-auto min-w-0 flex-1">
                {state ? <LiveChatFeed items={feedItems(state.messages, state.gifts, astrologerId)} className="max-h-[38vh]" /> : null}
              </div>
              <div className="pointer-events-auto">
                {session && state ? (
                  <Actions session={session} state={state} room={current} callOff={!!disabledReason} onCall={openCall} onGift={() => setGiftOpen(true)} onEndCall={() => setEndCallOpen(true)} />
                ) : null}
              </div>
            </div>
            {state && !ended ? <QueueLine state={state} reason={disabledReason} awaiting={!!standby} onOpen={openCall} /> : null}
            <div className="pointer-events-auto">
              <LiveComposer onSend={text => session?.sendChat(text) ?? false} disabled={!state || ended} />
            </div>
          </div>

          {/* Loading / ended states on top of everything. */}
          {!current && !notLive ? (
            <Centered>
              <Loader2 className="h-9 w-9 animate-spin text-white" aria-label="Loading" />
            </Centered>
          ) : null}
          {notLive || (ended && state?.endReason !== 'left') ? (
            <EndState state={state} notLive={notLive} others={others} onRejoin={() => setAgain(n => n + 1)} onGo={go} />
          ) : null}
        </div>

      </div>

      {/* Desktop: who is live above the chat, both in the right column (the player keeps the height for video). */}
      <div className={clsx('hidden min-h-0 flex-col gap-3 lg:flex', tall)}>
          <div className="rounded-2xl border border-[#BE7B71]/60 bg-[#FFFAE6] px-4 py-3">
            {info}
            {/* The buttons row: heart, share, gift, call. */}
            {session && state ? (
              <div className="mt-3 flex justify-center border-t border-[#BE7B71]/40 pt-3">
                <Actions session={session} state={state} room={current} callOff={!!disabledReason} onCall={openCall} onGift={() => setGiftOpen(true)} onEndCall={() => setEndCallOpen(true)} row />
              </div>
            ) : null}
            {state && !ended ? (
              <div className="mt-2">
                <QueueLine state={state} reason={disabledReason} awaiting={!!standby} onOpen={openCall} light />
              </div>
            ) : null}
          </div>
          <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#BE7B71]/60 bg-[#FFFAE6]">
            <div className="flex items-center justify-between border-b border-[#BE7B71]/40 px-4 py-2.5">
              <h2 className="font-app text-[16px] font-semibold text-[#4a1a1a]">Live chat</h2>
              {state ? <span className="font-app text-[13px] text-[#6d6d6d]">{compactCount(state.viewerCount)} watching</span> : null}
            </div>
            <div className="min-h-0 flex-1 p-3">
              {state ? <LiveChatFeed items={feedItems(state.messages, state.gifts, astrologerId)} className="h-full" tone="light" /> : null}
            </div>
            <div className="border-t border-[#BE7B71]/40 p-3">
              <LiveComposer onSend={text => session?.sendChat(text) ?? false} disabled={!state || ended} tone="light" />
            </div>
          </aside>
      </div>
      <div className="hidden lg:col-span-2 lg:block">{othersStrip}</div>

      <LeaveDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        others={others.slice(0, 3)}
        onExit={leave}
        onGo={r => {
          setLeaveOpen(false);
          go(r);
        }}
      />

      {session && state && current && !ended ? (
        <LiveCallSheet
          open={callOpen}
          onOpenChange={setCallOpen}
          room={{
            roomId: current.roomId,
            roomName: current.roomName,
            astrologerId: current.astrologerId,
            astrologerName: current.astrologerName ?? 'Astrologer',
          }}
          session={session}
          state={state}
          disabledReason={disabledReason}
          onResult={onCallResult}
        />
      ) : null}
      {session && state && current && !ended ? (
        <LiveGiftSheet
          open={giftOpen}
          onOpenChange={setGiftOpen}
          room={{
            roomId: current.roomId,
            roomName: current.roomName,
            astrologerId: current.astrologerId,
            astrologerName: current.astrologerName ?? 'Astrologer',
          }}
          session={session}
          countryCode={countryCode}
          onResult={showToast}
        />
      ) : null}
      {session && state && !ended ? (
        <>
          <LiveTurnDialog
            open={turn.open}
            onOpenChange={setTurnOpen}
            session={session}
            state={state}
            blockedReason={inConsultation ? JOIN_BLOCKED_IN_CONSULTATION : null}
          />
          <LiveEndCallDialog
            open={endCallOpen}
            onOpenChange={setEndCallOpen}
            onConfirm={() => {
              setEndCallOpen(false);
              void session.endCall();
            }}
          />
        </>
      ) : null}
      {/* After my call: the review, once per call (also when the stream ended during it). */}
      {session && state?.reviewFor && current ? (
        <ReviewDialog
          astrologerId={current.astrologerId}
          liveQueueId={state.reviewFor}
          astrologerName={current.astrologerName ?? 'Astrologer'}
          photo={current.astrologerAvatar ?? null}
          onClose={() => session.clearReview()}
          onDone={() => {
            session.clearReview();
            showToast({ tone: 'good', title: 'Thank you!', text: 'Your rating was submitted.' });
          }}
        />
      ) : null}
      {shownToast ? <LiveToast key={shownToast.id} toast={shownToast} onDismiss={dismissToast} /> : null}
    </div>
  );
}

const ERROR_TOAST_ID = -1_000_000;

type LiveToastMessage = { id: number; tone: 'good' | 'info' | 'bad'; title: string; text: string };

/** The app's live toast: one line or two over the stream, gone after a few seconds or a tap. */
function LiveToast({ toast, onDismiss }: { toast: LiveToastMessage; onDismiss: () => void }) {
  const { id, tone } = toast;
  useEffect(() => {
    const timer = setTimeout(onDismiss, tone === 'bad' ? 8000 : 5000);
    return () => clearTimeout(timer);
  }, [id, tone, onDismiss]);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(72px,calc(env(safe-area-inset-top)+64px))] z-[95] flex justify-center px-4">
      <button
        type="button"
        role="status"
        aria-live="polite"
        onClick={onDismiss}
        className={clsx(
          'pointer-events-auto flex w-full max-w-[420px] flex-col gap-0.5 rounded-2xl px-4 py-3 text-left font-app shadow-lg',
          toast.tone === 'good' ? 'bg-[#1f5130] text-white' : toast.tone === 'bad' ? 'bg-[#7a1f1a] text-white' : 'bg-[#2b1b14]/95 text-white',
        )}
      >
        <span className="text-[15px] font-semibold">{toast.title}</span>
        {toast.text ? <span className="text-[13px] text-white/85">{toast.text}</span> : null}
      </button>
    </div>
  );
}

/**
 * The app's bottom queue notice: my place in the queue, or why Call is off, or the standing "calls are open" line.
 * Tapping it opens the call sheet (my place in the queue).
 */
function QueueLine({
  state,
  reason,
  awaiting,
  onOpen,
  light = false,
}: {
  state: LiveState;
  reason: string | null;
  awaiting: boolean;
  onOpen: () => void;
  light?: boolean;
}) {
  // While I'm in my own call the call screen speaks for itself (step 5).
  if (state.phase === 'in-call' || state.phase === 'joining-call') return null;
  const mine = myQueueText(state.me);
  const text = mine ?? reason ?? (state.queue?.canPay ? 'Live calls are open — tap Call to book your slot' : null);
  if (!text) return null;
  const highlight = !!mine || awaiting;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsx(
        'w-full truncate rounded-full px-3 py-1.5 text-left font-app text-[12px] font-semibold',
        light
          ? highlight
            ? 'bg-primary text-white'
            : 'bg-[#F1DBD7] text-[#4a1a1a]'
          : highlight
            ? 'pointer-events-auto bg-primary/90 text-white'
            : 'pointer-events-auto bg-black/50 text-white',
      )}
    >
      {text}
    </button>
  );
}

// ---- The video area ----

function Stage({ session, state, room, me }: { session: LiveSession | null; state: LiveState | null; room: LiveRoomSummary | null; me: Me }) {
  const hostVideo = useRef<HTMLVideoElement>(null);
  const callerVideo = useRef<HTMLVideoElement>(null);
  const selfVideo = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLDivElement>(null);
  useEffect(() => {
    session?.setMediaElements({
      hostVideo: hostVideo.current,
      callerVideo: callerVideo.current,
      selfVideo: selfVideo.current,
      audio: audio.current,
    });
  }, [session]);

  const call = state?.call ?? null;
  const mine = !!call && call.callerId === me.id;
  // Split screen: public_video for everyone, every mode for the caller themself (the app's rule).
  const split = !!call && (mine || call.mode === 'public_video');
  const privateOverlay = !!call && !mine && call.mode === 'private_audio';
  const hostOn = !!state?.host.cameraOn;
  const name = room?.astrologerName ?? 'Astrologer';

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row">
      {/* Desktop backdrop: the astrologer's photo blurred behind the fitted video (a phone camera is portrait). */}
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden>
        {room?.astrologerAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.astrologerAvatar} alt="" className="h-full w-full scale-125 object-cover opacity-50 blur-2xl" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#4a1a1a] via-[#2b1010] to-black" />
        )}
      </div>
      <div className={clsx('relative min-h-0 bg-black lg:bg-transparent', split ? 'flex-1 border-b border-white/20 lg:border-b-0 lg:border-r' : 'h-full lg:w-full')}>
        <video ref={hostVideo} autoPlay playsInline muted className={clsx('h-full w-full object-cover lg:object-contain', !hostOn && 'invisible')} />
        {!hostOn ? (
          <Centered>
            <Avatar url={room?.astrologerAvatar} name={name} size={84} />
            <p className="mt-3 font-app text-[14px] text-white/80">
              {state?.host.present ? `${name} has turned off the camera` : state ? 'Waiting for the astrologer...' : ''}
            </p>
          </Centered>
        ) : null}
      </div>
      <div className={clsx('relative min-h-0 bg-black lg:bg-transparent', split ? 'flex-1' : 'hidden')}>
        <video ref={callerVideo} autoPlay playsInline muted className={clsx('h-full w-full object-cover lg:object-contain', (mine || !state?.callerCameraOn) && 'hidden')} />
        <video
          ref={selfVideo}
          autoPlay
          playsInline
          muted
          className={clsx('h-full w-full object-cover lg:object-contain', state?.facing !== 'environment' && '-scale-x-100', (!mine || !state?.cameraOn) && 'hidden')}
        />
        {split && !(mine ? state?.cameraOn : state?.callerCameraOn) ? (
          <Centered>
            <p className="font-app text-[14px] text-white/80">{mine ? 'Your camera is off' : `${call?.callerName ?? 'The caller'} has turned off the camera`}</p>
          </Centered>
        ) : null}
      </div>
      <div ref={audio} className="hidden" aria-hidden />

      {privateOverlay ? (
        <Centered className="bg-black/10">
          <Lock className="h-12 w-12 text-white/90" strokeWidth={1.5} aria-hidden />
          <p className="mt-2 font-app text-[20px] font-semibold text-white/90">Private Consultation</p>
          <p className="font-app text-[14px] text-white/70">The astrologer is in a private session</p>
        </Centered>
      ) : null}

      {state?.audioBlocked && state.phase !== 'ended' ? (
        <Centered>
          <button
            type="button"
            onClick={() => void session?.startAudio()}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-app text-[16px] font-semibold text-white shadow-lg"
          >
            <Volume2 className="h-5 w-5" aria-hidden /> Tap to join with sound
          </button>
        </Centered>
      ) : null}

      {session && state ? <LiveResumeCall session={session} state={state} /> : null}

      {state?.phase === 'reconnecting' ? (
        <div className="absolute left-1/2 top-24 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 font-app text-[13px] text-white">
          Reconnecting...
        </div>
      ) : null}
    </div>
  );
}

// ---- Header ----

function LiveHeader({ room, state, me, onClose }: { room: LiveRoomSummary; state: LiveState | null; me: Me; onClose: () => void }) {
  const name = room.astrologerName ?? 'Astrologer';
  const price = state?.queue?.price ? `${formatCallSlotPrice(state.queue.price)} / 10 min | ` : '';
  const call = state?.call ?? null;
  const mine = !!call && call.callerId === me.id;
  const banner = callBannerText(call?.mode ?? null, mine ? name : (call?.callerName ?? null), mine ? 'caller' : 'viewer');
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-3 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2">
        <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 rounded-full bg-black/50 py-1 pl-1.5 pr-3">
          <Link href={`/astrologer-profile/${encodeURIComponent(room.astrologerId)}`} className="relative shrink-0" aria-label={`${name}'s profile`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
              <Avatar url={room.astrologerAvatar} name={name} size={32} />
            </span>
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded border border-white bg-primary px-1 font-app text-[8px] font-bold leading-[11px] text-white">
              Live
            </span>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-app text-[13px] font-bold text-white">{name}</p>
            <p className="truncate font-app text-[11px] font-medium text-white/70">
              {price}
              <span aria-hidden>👁︎ </span>
              <span className="sr-only">watching </span>
              {compactCount(state?.viewerCount ?? room.viewerCount)}
            </p>
          </div>
          <FollowButton astrologerId={room.astrologerId} />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/50 text-white"
        >
          <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </button>
      </div>
      {banner ? (
        <div className="flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF3B30]" aria-hidden />
          <span className="truncate font-app text-[12px] font-semibold text-white">{banner}</span>
        </div>
      ) : null}
      {call?.kickAt ? <CountdownPill endsAt={call.kickAt} /> : null}
    </div>
  );
}

function CallPills({ state, me, name, onClose }: { state: LiveState | null; me: Me; name: string; onClose: () => void }) {
  const call = state?.call ?? null;
  const mine = !!call && call.callerId === me.id;
  const banner = callBannerText(call?.mode ?? null, mine ? name : (call?.callerName ?? null), mine ? 'caller' : 'viewer');
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
      <div className="flex flex-col gap-2">
        {banner ? (
          <div className="flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF3B30]" aria-hidden />
            <span className="truncate font-app text-[12px] font-semibold text-white">{banner}</span>
          </div>
        ) : null}
        {call?.kickAt ? <CountdownPill endsAt={call.kickAt} /> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/50 text-white"
      >
        <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}

function FollowButton({ astrologerId, large = false }: { astrologerId: string; large?: boolean }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const statusKey = ['follow', 'status', astrologerId];
  const status = useQuery({
    queryKey: statusKey,
    queryFn: () => backend.get<{ isFollowing?: boolean }>(`/follow/status/${encodeURIComponent(astrologerId)}?followeeType=ASTROLOGER`),
  });
  const following = Boolean(status.data?.isFollowing);
  const body = { followeeId: astrologerId, followeeType: 'ASTROLOGER' };
  const toggle = useMutation({
    mutationFn: () => (following ? backend.delete('/follow', body) : backend.post('/follow', body)),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: statusKey });
      void queryClient.invalidateQueries({ queryKey: ['follow', 'following'] });
    },
  });
  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={status.isPending || toggle.isPending}
      aria-pressed={following}
      className={clsx(
        'shrink-0 rounded-full font-app font-bold disabled:opacity-70',
        large ? 'h-[42px] px-6 text-[15px]' : 'px-3.5 py-1.5 text-[12px]',
        following
          ? large
            ? 'border border-[#BE7B71] text-primary'
            : 'bg-black/35 text-white'
          : 'bg-primary text-white',
      )}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}

/** The app's LiveSlotCountdownPill: time left in the call slot, amber under five minutes, red under one. */
function CountdownPill({ endsAt }: { endsAt: number }) {
  const [left, setLeft] = useState(() => Math.ceil((endsAt - Date.now()) / 1000));
  useEffect(() => {
    const tick = () => setLeft(Math.ceil((endsAt - Date.now()) / 1000));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);
  const tone = countdownTone(left);
  return (
    <div
      className={clsx(
        'w-fit rounded-full px-3 py-1 font-app text-[12px] font-bold',
        tone === 'urgent' ? 'bg-[#FF3B30] text-white' : tone === 'warning' ? 'bg-[#F5C542] text-black' : 'bg-black/55 text-white',
      )}
      aria-label="Time left in the call"
    >
      {formatCountdown(left)}
    </div>
  );
}

// ---- Actions (heart, share, call; gift comes with step 6) ----

function Actions({
  session,
  state,
  room,
  callOff,
  onCall,
  onGift,
  onEndCall,
  row = false,
}: {
  session: LiveSession;
  state: LiveState;
  room: LiveRoomSummary | null;
  /** Call can't be booked now: greyed out, still tappable (the sheet says why), like the app. */
  callOff: boolean;
  onCall: () => void;
  onGift: () => void;
  onEndCall: () => void;
  row?: boolean;
}) {
  const [shared, setShared] = useState(false);
  const share = async () => {
    if (!room) return;
    const url = `${window.location.origin}${livePath(room.astrologerId)}`;
    const name = room.astrologerName ?? 'an astrologer';
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} is live on AstroSewa`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      // Share sheet closed: nothing to do.
    }
  };
  const item = clsx('flex flex-col items-center gap-0.5 font-app text-[11px] font-semibold', row ? 'text-[#4a1a1a]' : 'text-white');
  const circle = 'flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8B5E3C] bg-[#F5F0E8] text-[#8B5E3C] disabled:opacity-70';
  return (
    <div className={clsx('flex items-end', row ? 'flex-row gap-8' : 'flex-col gap-2')}>
      <button type="button" onClick={() => void session.like()} disabled={state.hasLiked} className={item} aria-pressed={state.hasLiked} aria-label="Like">
        <span className={circle}>
          <Heart className={clsx('h-6 w-6', state.hasLiked && 'fill-[#FF3B30] text-[#FF3B30]')} aria-hidden />
        </span>
        {compactCount(state.likeCount)}
      </button>
      {/* In my call the column is for the call's buttons. */}
      {state.phase !== 'in-call' ? (
        <button type="button" onClick={() => void share()} className={item} aria-label="Share">
          <span className={circle}>{shared ? <Check className="h-6 w-6" aria-hidden /> : <Share2 className="h-6 w-6" aria-hidden />}</span>
          {shared ? 'Copied' : 'Share'}
        </button>
      ) : null}
      {/* In my call: its own buttons instead of Call (the app's in-call column). */}
      {state.phase === 'in-call' ? <LiveCallControls session={session} state={state} onEnd={onEndCall} row={row} /> : null}
      {/* Gift: viewers not on the call themselves (the app's rule). */}
      {state.phase !== 'in-call' && state.phase !== 'joining-call' ? (
        <button type="button" onClick={onGift} className={item} aria-label="Send a gift">
          <span className={circle}>
            <Gift className="h-6 w-6" aria-hidden />
          </span>
          Gift
        </button>
      ) : null}
      {state.phase !== 'in-call' && state.phase !== 'joining-call' ? (
        <button type="button" onClick={onCall} className={clsx(item, callOff && !state.me && 'opacity-60')} aria-label={state.me ? 'Your live call' : 'Call Now'}>
          <span className={circle}>
            <Phone className="h-6 w-6" aria-hidden />
          </span>
          {state.me ? 'Queue' : 'Call'}
        </button>
      ) : null}
    </div>
  );
}

// ---- Ended / not live ----

function EndState({
  state,
  notLive,
  others,
  onRejoin,
  onGo,
}: {
  state: LiveState | null;
  notLive: boolean;
  others: LiveRoomSummary[];
  onRejoin: () => void;
  onGo: (room: LiveRoomSummary) => void;
}) {
  const reason = notLive ? 'not-live' : state?.endReason;
  const lost = reason === 'connection-lost' || reason === 'failed' || reason === 'other-device';
  const title =
    reason === 'kicked'
      ? 'You were removed from this live stream'
      : reason === 'other-device'
        ? 'This stream opened somewhere else'
        : reason === 'connection-lost'
          ? 'Connection lost'
          : reason === 'failed'
            ? 'Could not join'
            : 'This live stream has ended';
  const text =
    reason === 'kicked'
      ? 'You cannot rejoin this live stream.'
      : reason === 'other-device'
        ? 'The same account joined this stream from another app or tab.'
        : lost
          ? (state?.error ?? 'Check your internet connection and try again.')
          : others.length
            ? 'Others are live too!'
            : 'Check back soon!';
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-black/85 p-6 text-center">
      <p className="font-app text-[22px] font-semibold text-white">{title}</p>
      <p className="max-w-sm font-app text-[15px] text-white/75">{text}</p>
      {lost ? (
        <button type="button" onClick={onRejoin} className="rounded-full bg-primary px-6 py-2.5 font-app text-[16px] font-semibold text-white">
          Rejoin
        </button>
      ) : null}
      {!lost && reason !== 'kicked' && others.length ? (
        <ul className="flex w-full max-w-sm flex-col gap-2">
          {others.slice(0, 3).map(r => (
            <li key={r.roomId}>
              <button type="button" onClick={() => onGo(r)} className="flex w-full items-center gap-3 rounded-lg border border-[#BE7B71] bg-[#FFFAE6] p-2 text-left">
                <Avatar url={r.astrologerAvatar} name={r.astrologerName ?? 'Astrologer'} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-app text-[16px] font-semibold text-primary">{r.astrologerName ?? 'Astrologer'}</span>
                  <span className="block font-app text-[13px] text-[#1C1C1C]">{r.viewerCount} watching</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <Link href="/live" className="rounded-full border border-white/60 px-6 py-2.5 font-app text-[16px] text-white">
        Back to Live
      </Link>
    </div>
  );
}

/** The app's LiveLeaveSheet: confirm leaving, with other live rooms as a nudge to stay. */
function LeaveDialog({
  open,
  onOpenChange,
  others,
  onExit,
  onGo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  others: LiveRoomSummary[];
  onExit: () => void;
  onGo: (room: LiveRoomSummary) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/45" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-[81] rounded-t-[24px] bg-[#FFFAE6] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 outline-none lg:left-1/2 lg:top-1/2 lg:w-[420px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[20px]">
          <DialogPrimitive.Close className="mx-auto mb-2 flex items-center gap-1 font-app text-[15px] text-primary" aria-label="Close">
            <ChevronDown className="h-4 w-4" aria-hidden /> Close
          </DialogPrimitive.Close>
          <DialogPrimitive.Title className="font-app text-[20px] font-semibold text-[#4a1a1a]">
            {others.length ? 'Others are live too!' : 'Leave live stream?'}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 font-app text-[15px] text-[#6d6d6d]">
            {others.length ? 'Check them out before you leave' : 'Are you sure you want to exit?'}
          </DialogPrimitive.Description>
          {others.length ? (
            <ul className="mt-3 flex flex-col gap-2">
              {others.map(r => (
                <li key={r.roomId}>
                  <button type="button" onClick={() => onGo(r)} className="flex w-full items-center gap-3 rounded-lg border border-[#BE7B71] bg-white/60 p-2 text-left">
                    <Avatar url={r.astrologerAvatar} name={r.astrologerName ?? 'Astrologer'} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-app text-[16px] font-semibold text-primary">{r.astrologerName ?? 'Astrologer'}</span>
                      <span className="block font-app text-[13px] text-[#1C1C1C]">{r.viewerCount} watching</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-5 flex gap-3">
            <DialogPrimitive.Close className="h-[46px] flex-1 rounded-full border border-[#BE7B71] font-app text-[16px] text-primary">
              Cancel
            </DialogPrimitive.Close>
            <button type="button" onClick={onExit} className="h-[46px] flex-1 rounded-full bg-primary font-app text-[16px] font-semibold text-white">
              {others.length ? 'Exit anyway' : 'Exit'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ---- Bits ----

function Avatar({ url, name, size }: { url?: string | null; name: string; size: number }) {
  const style = { width: size, height: size };
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" style={style} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span style={{ ...style, fontSize: Math.round(size * 0.42) }} className="flex shrink-0 items-center justify-center rounded-full bg-[#F1DBD7] font-app font-semibold text-primary">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function Centered({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('absolute inset-0 flex flex-col items-center justify-center p-6 text-center', className)}>{children}</div>;
}

function ArrowButton({ children, label, disabled, onClick }: { children: React.ReactNode; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4a1a1a]/85 text-white shadow transition hover:bg-primary disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  );
}
