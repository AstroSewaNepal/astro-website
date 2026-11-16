'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Check, ChevronDown, ChevronUp, Heart, Loader2, Lock, Share2, Volume2, X } from 'lucide-react';

import { LiveChatFeed, LiveComposer } from '@/components/live/live-chat';
import { LIVE_ROOMS_KEY } from '@/components/live/live-feed';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import { useLiveSession } from '@/hooks/use-live-session';
import { usePhoneFullScreen } from '@/hooks/use-phone-full-screen';
import { liveApi, type LiveRoomSummary } from '@/lib/live/api';
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

  const go = useCallback((target: LiveRoomSummary | null) => {
    if (!target) return;
    setAstrologerId(target.astrologerId);
    window.history.replaceState(window.history.state, '', livePath(target.astrologerId));
  }, []);

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
    if (!start || !t || state?.phase === 'in-call' || state?.phase === 'joining-call') return;
    const dir = swipeDirection(start, { x: t.clientX, y: t.clientY, t: Date.now() });
    if (dir === 'up') go(next);
    if (dir === 'down') go(prev);
  };

  const [leaveOpen, setLeaveOpen] = useState(false);
  const leave = () => {
    void session?.end();
    router.push('/live');
  };

  const root = useRef<HTMLDivElement>(null);
  usePhoneFullScreen(root);

  const ended = state?.phase === 'ended';
  const notLive = rooms.isSuccess && !current;
  const others = list.filter(r => r.astrologerId !== astrologerId);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[60] flex flex-col bg-black lg:static lg:z-auto lg:h-auto lg:flex-row lg:items-stretch lg:justify-center lg:gap-5 lg:bg-transparent"
    >
      {/* The player: the whole screen on phones, a portrait card on desktop. */}
      <div className="relative flex min-h-0 flex-1 lg:flex-none lg:py-2">
        <div
          className="relative flex h-full w-full flex-col overflow-hidden bg-black lg:aspect-[9/16] lg:h-[min(calc(100vh-150px),820px)] lg:w-auto lg:rounded-2xl"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Stage session={session} state={state} room={current} me={me} />

          {/* Header over the video (both layouts). */}
          {current ? (
            <LiveHeader room={current} state={state} me={me} onClose={() => setLeaveOpen(true)} />
          ) : null}

          {/* Phone: chat feed left, actions right, composer along the bottom (over the video). */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
            <div className="flex items-end gap-2">
              <div className="pointer-events-auto min-w-0 flex-1">
                {state ? <LiveChatFeed items={feedItems(state.messages, state.gifts, astrologerId)} className="max-h-[38vh]" /> : null}
              </div>
              <div className="pointer-events-auto">{session && state ? <Actions session={session} state={state} room={current} /> : null}</div>
            </div>
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

        {/* Desktop: Shorts-style up/down arrows beside the player. */}
        <div className="absolute right-[-56px] top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
          <ArrowButton label="Previous stream" disabled={!prev} onClick={() => go(prev)}>
            <ChevronUp className="h-6 w-6" aria-hidden />
          </ArrowButton>
          <ArrowButton label="Next stream" disabled={!next} onClick={() => go(next)}>
            <ChevronDown className="h-6 w-6" aria-hidden />
          </ArrowButton>
        </div>
      </div>

      {/* Desktop: the chat beside the player. */}
      <aside className="hidden min-h-0 w-[380px] flex-col rounded-2xl border border-[#BE7B71]/60 bg-[#FFFAE6] lg:ml-14 lg:flex lg:h-[min(calc(100vh-150px),820px)] lg:self-center xl:w-[420px]">
        <div className="flex items-center justify-between border-b border-[#BE7B71]/40 px-4 py-3">
          <h2 className="font-app text-[17px] font-semibold text-[#4a1a1a]">Live chat</h2>
          {state ? <span className="font-app text-[13px] text-[#6d6d6d]">{compactCount(state.viewerCount)} watching</span> : null}
        </div>
        <div className="min-h-0 flex-1 bg-[#2b2320] p-3">
          {state ? <LiveChatFeed items={feedItems(state.messages, state.gifts, astrologerId)} className="h-full" /> : null}
        </div>
        <div className="flex items-center gap-3 border-t border-[#BE7B71]/40 p-3">
          <LiveComposer onSend={text => session?.sendChat(text) ?? false} disabled={!state || ended} className="flex-1" />
          {session && state ? <Actions session={session} state={state} room={current} row /> : null}
        </div>
      </aside>

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
    </div>
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
    <div className="absolute inset-0 flex flex-col">
      <div className={clsx('relative min-h-0 bg-black', split ? 'flex-1 border-b border-white/20' : 'h-full')}>
        <video ref={hostVideo} autoPlay playsInline muted className={clsx('h-full w-full object-cover', !hostOn && 'invisible')} />
        {!hostOn ? (
          <Centered>
            <Avatar url={room?.astrologerAvatar} name={name} size={84} />
            <p className="mt-3 font-app text-[14px] text-white/80">
              {state?.host.present ? `${name} has turned off the camera` : state ? 'Waiting for the astrologer...' : ''}
            </p>
          </Centered>
        ) : null}
      </div>
      <div className={clsx('relative min-h-0 bg-black', split ? 'flex-1' : 'hidden')}>
        <video ref={callerVideo} autoPlay playsInline muted className={clsx('h-full w-full object-cover', (mine || !state?.callerCameraOn) && 'hidden')} />
        <video ref={selfVideo} autoPlay playsInline muted className={clsx('h-full w-full -scale-x-100 object-cover', (!mine || !state?.cameraOn) && 'hidden')} />
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

function FollowButton({ astrologerId }: { astrologerId: string }) {
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
        'shrink-0 rounded-full px-3.5 py-1.5 font-app text-[12px] font-bold text-white disabled:opacity-70',
        following ? 'bg-black/35' : 'bg-primary',
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

// ---- Actions (heart, share; gift and call come with steps 4 and 6) ----

function Actions({ session, state, room, row = false }: { session: LiveSession; state: LiveState; room: LiveRoomSummary | null; row?: boolean }) {
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
  const item = 'flex flex-col items-center gap-0.5 font-app text-[11px] font-semibold text-white lg:text-[#4a1a1a]';
  const circle = 'flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8B5E3C] bg-[#F5F0E8] text-[#8B5E3C] disabled:opacity-70';
  return (
    <div className={clsx('flex items-end', row ? 'flex-row gap-3' : 'flex-col gap-2')}>
      <button type="button" onClick={() => void session.like()} disabled={state.hasLiked} className={item} aria-pressed={state.hasLiked} aria-label="Like">
        <span className={circle}>
          <Heart className={clsx('h-6 w-6', state.hasLiked && 'fill-[#FF3B30] text-[#FF3B30]')} aria-hidden />
        </span>
        {compactCount(state.likeCount)}
      </button>
      <button type="button" onClick={() => void share()} className={item} aria-label="Share">
        <span className={circle}>{shared ? <Check className="h-6 w-6" aria-hidden /> : <Share2 className="h-6 w-6" aria-hidden />}</span>
        {shared ? 'Copied' : 'Share'}
      </button>
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
