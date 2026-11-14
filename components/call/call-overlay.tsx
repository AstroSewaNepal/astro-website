'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Loader2, MonitorSmartphone, RefreshCw, X } from 'lucide-react';

import {
  CallIcon,
  CameraOffIcon,
  CameraOnIcon,
  MicIcon,
  MicOffIcon,
  VideoCallIcon,
} from '@/components/call/call-icons';
import type { CallRequest } from '@/components/call/call-provider';
import { CallScreen, Photo, type CallLayout } from '@/components/call/call-screen';
import { useBackendClient } from '@/hooks/use-backend-client';
import { callApi, callStartError } from '@/lib/call/api';
import { createLiveKitRoom } from '@/lib/call/livekit-room';
import {
  cameraFallbackNote,
  getCallMedia,
  MediaCheckError,
  mediaHelp,
  platformOf,
  stopMedia,
  type CallMedia,
  type MediaProblem,
} from '@/lib/call/media-check';
import { CallSession, type CallEndReason, type CallState } from '@/lib/call/session';
import { takeCallLock } from '@/lib/call/tab-lock';
import { keepScreenOn } from '@/lib/call/wake-lock';

type Stage =
  | { kind: 'checking' }
  | { kind: 'ready'; media: CallMedia }
  | { kind: 'blocked'; problem: MediaProblem }
  | { kind: 'call'; session: CallSession };

/** Endings that need no explanation: the screen says so briefly and closes by itself. */
const QUIET_ENDS = new Set<CallEndReason>(['hangup', 'other-left', 'time-up']);
const QUIET_END_MS = 1_800;

/** Room kept free around the small call window. */
const MINI_MARGIN = 8;

/**
 * The call over the page: the before-call screen (camera and mic check with a preview, choices, Join), then the
 * call. Placement:
 * - docked: desktop with the booking's chat page open, beside the chat (Figma desktop call);
 * - full: phones full screen, desktop a centred panel;
 * - mini: a small window in a corner that can be dragged anywhere, so the person keeps using the site. A call goes
 *   mini when the page changes under it (desktop leaving the chat, the phone's back button) or on Minimize; a tap
 *   on it opens it full again.
 * The same elements stay mounted whichever way it is placed, so the call never restarts.
 */
export default function CallOverlay({
  request,
  dock,
  onClose,
  onAgain,
  onTimeUp,
}: {
  request: CallRequest;
  dock: HTMLElement | null;
  onClose: () => void;
  onAgain: () => void;
  /** The session's time ran out during the call (the provider may open the review). */
  onTimeUp: (request: CallRequest) => void;
}) {
  const backend = useBackendClient();
  const [stage, setStage] = useState<Stage>({ kind: 'checking' });
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(request.callType === 'video');
  const isVideo = request.callType === 'video';

  // The preview's camera and mic, released when it closes or the call takes over.
  const previewStream = useRef<MediaStream | null>(null);
  // Bumped by "Try again".
  const [attempt, setAttempt] = useState(0);

  // One call per browser: the lock is held from the before-call screen until the call ends or this closes.
  const [lock, setLock] = useState<'pending' | 'held' | 'taken'>('pending');
  const [lockAttempt, setLockAttempt] = useState(0);
  const releaseLock = useRef(() => {});
  useEffect(() => {
    let current = true;
    // A tick later, so React's development double mount lets go before the real one asks.
    const t = setTimeout(() => {
      void takeCallLock().then(taken => {
        if (!current) return taken?.release();
        if (taken) releaseLock.current = taken.release;
        setLock(taken ? 'held' : 'taken');
      });
    }, 0);
    return () => {
      current = false;
      clearTimeout(t);
      releaseLock.current();
      releaseLock.current = () => {};
    };
  }, [lockAttempt]);
  const retryLock = () => {
    setLock('pending');
    setLockAttempt(n => n + 1);
  };

  // Checks as soon as the lock is ours: the tap on the chat's call button just happened, so Safari shows its prompt.
  useEffect(() => {
    if (lock !== 'held') return;
    let current = true;
    getCallMedia(request.callType).then(
      media => {
        if (!current) {
          stopMedia(media.stream);
          return;
        }
        stopMedia(previewStream.current);
        previewStream.current = media.stream;
        setCamera(request.callType === 'video' && media.cameraProblem === null);
        setStage({ kind: 'ready', media });
      },
      error => {
        if (!current) return;
        setStage({
          kind: 'blocked',
          problem: error instanceof MediaCheckError ? error.problem : 'unknown',
        });
      },
    );
    return () => {
      current = false;
    };
  }, [request.callType, attempt, lock]);
  useEffect(() => () => stopMedia(previewStream.current), []);
  const retry = () => {
    setStage({ kind: 'checking' });
    setAttempt(n => n + 1);
  };

  // Preview choices act on the preview's own tracks.
  useEffect(() => {
    if (stage.kind !== 'ready') return;
    for (const track of stage.media.stream.getAudioTracks()) track.enabled = mic;
    for (const track of stage.media.stream.getVideoTracks()) track.enabled = camera;
  }, [stage, mic, camera]);

  const join = () => {
    if (stage.kind !== 'ready') return;
    const session = new CallSession({
      bookingId: request.bookingId,
      callType: request.callType,
      endsAt: request.endsAt,
      api: callApi(backend),
      createRoom: createLiveKitRoom,
      describeError: callStartError,
    });
    // The call opens the camera and mic itself; the preview lets go of them first (phones allow one user).
    stopMedia(previewStream.current);
    previewStream.current = null;
    setStage({ kind: 'call', session });
    void session.start({ mic, camera: isVideo && camera });
  };

  // Logging out unmounts this: hang up.
  const session = stage.kind === 'call' ? stage.session : null;
  useEffect(() => () => void session?.end(), [session]);
  const callState = useCallState(session);
  const inCall = !!session && callState?.phase !== 'ended';

  // Ended (even with its message still on screen): another tab may start a call now.
  useEffect(() => {
    if (callState?.phase === 'ended') releaseLock.current();
  }, [callState?.phase]);

  // During the call: the screen stays on, closing or reloading the tab asks first (the browser's own "Leave site?"),
  // and a page that goes away anyway leaves the room at once instead of after LiveKit's timeout.
  useEffect(() => {
    if (!inCall || !session) return;
    const stopWake = keepScreenOn();
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Older browsers need a value to show the prompt; the text itself is never shown.
      e.returnValue = '';
    };
    const onPageHide = () => session.leavePage();
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      stopWake();
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [inCall, session]);

  // Time up: the provider decides whether the review opens from here (chat page not on screen).
  const timeUp = callState?.endReason === 'time-up';
  const timeUpSeen = useRef(false);
  useEffect(() => {
    if (!timeUp || timeUpSeen.current) return;
    timeUpSeen.current = true;
    onTimeUp(request);
  }, [timeUp, onTimeUp, request]);

  // A plain ending says "Call ended" for a moment and closes; problems stay until the person closes them.
  const quietEnd =
    callState?.phase === 'ended' &&
    QUIET_ENDS.has(callState.endReason ?? 'hangup') &&
    !callState.error;
  useEffect(() => {
    if (!quietEnd) return;
    const t = setTimeout(onClose, QUIET_END_MS);
    return () => clearTimeout(t);
  }, [quietEnd, onClose]);

  // Placement. Desktop with the booking's chat open: exactly over the slot beside the chat.
  const desktop = useMediaQuery('(min-width: 1024px)');
  const dockRect = useElementRect(desktop ? dock : null);
  const docked = dockRect !== null;

  // Full or mini when not docked. Moving to another page during the call makes it small, so the page can be used.
  const [view, setView] = useState<'full' | 'mini'>('full');
  const pathname = usePathname();
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (session) setView('mini');
  }
  const layout: CallLayout = docked
    ? 'docked'
    : // The before-call screen and endings that need reading are always full.
      !session || (callState?.phase === 'ended' && !quietEnd) || view === 'full'
      ? 'full'
      : 'mini';
  const minimize = useCallback(() => setView('mini'), []);
  const expand = useCallback(() => setView('full'), []);

  // Keep the page behind still while the call covers it (docked or mini, the page stays usable).
  useEffect(() => {
    if (layout !== 'full') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [layout]);

  // Escape makes a full call small again (desktop).
  useEffect(() => {
    if (layout !== 'full' || !session) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') minimize();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [layout, session, minimize]);

  const mini = layout === 'mini';
  // Video calls keep a video tile (their video or photo, mine in its corner, like the app's PiP); voice calls a card.
  const miniVideo = mini && !!callState?.video;
  const drag = useMiniDrag(mini, () => {
    // A tap is a user gesture: let the browser play their voice if it held it back.
    if (callState?.audioBlocked) void session?.startAudio();
    expand();
  });

  const closeLobby = () => {
    stopMedia(previewStream.current);
    previewStream.current = null;
    onClose();
  };

  return (
    <div
      className={clsx(
        'font-app',
        layout === 'docked' && 'fixed z-30',
        layout === 'full' &&
          'fixed inset-0 z-[70] flex items-center justify-center bg-black/60 lg:p-8',
        mini && [
          'fixed z-[60] cursor-grab touch-none select-none',
          miniVideo ? 'h-[230px] w-[156px] lg:h-[400px] lg:w-[290px]' : 'h-[68px] w-[300px]',
          // Above the phone's bottom tabs until it is dragged.
          !drag.offset &&
            'bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 lg:bottom-6 lg:right-6',
        ],
      )}
      style={
        dockRect
          ? {
              top: dockRect.top,
              left: dockRect.left,
              width: dockRect.width,
              height: dockRect.height,
            }
          : mini && drag.offset
            ? { right: drag.offset.right, bottom: drag.offset.bottom }
            : undefined
      }
      {...(mini ? drag.handlers : {})}
    >
      <section
        role="dialog"
        aria-modal={layout === 'full'}
        aria-label={`${isVideo ? 'Video' : 'Voice'} call with ${request.partner.name}`}
        className={clsx(
          'flex flex-col overflow-hidden bg-[#16110f] text-white',
          layout === 'docked' &&
            'h-full w-full rounded-2xl shadow-[0_4px_16px_rgba(92,56,23,0.08)]',
          layout === 'full' &&
            'h-[100dvh] w-full lg:h-[min(760px,calc(100dvh-4rem))] lg:max-w-[1100px] lg:rounded-2xl lg:shadow-2xl',
          mini && 'h-full w-full rounded-2xl shadow-2xl ring-1 ring-white/15',
        )}
      >
        {lock === 'taken' ? (
          <>
            <LobbyHeader request={request} onCancel={closeLobby} />
            <OtherTab onClose={closeLobby} onRetry={retryLock} />
          </>
        ) : stage.kind !== 'call' ? (
          <>
            <LobbyHeader request={request} onCancel={closeLobby} />
            <Lobby
              stage={stage}
              request={request}
              mic={mic}
              camera={camera}
              onMic={() => setMic(v => !v)}
              onCamera={() => setCamera(v => !v)}
              onRetry={retry}
              onJoin={join}
            />
          </>
        ) : callState?.phase === 'ended' ? (
          <Ended
            state={callState}
            request={request}
            compact={mini}
            onClose={onClose}
            onAgain={onAgain}
          />
        ) : callState ? (
          <CallScreen
            session={stage.session}
            state={callState}
            request={request}
            layout={layout}
            onMinimize={minimize}
            onExpand={expand}
          />
        ) : null}
      </section>
    </div>
  );
}

function useCallState(session: CallSession | null): CallState | null {
  return useSyncExternalStore(
    useCallback(listener => session?.subscribe(listener) ?? (() => {}), [session]),
    () => session?.getState() ?? null,
    () => null,
  );
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    useCallback(
      listener => {
        const list = window.matchMedia(query);
        list.addEventListener('change', listener);
        return () => list.removeEventListener('change', listener);
      },
      [query],
    ),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

type Offset = { right: number; bottom: number };

/**
 * Dragging the small call window. It keeps its distance from the bottom-right corner (null until first dragged:
 * the default corner). A press that doesn't move is a tap. Buttons inside keep their own clicks.
 */
function useMiniDrag(active: boolean, onTap: () => void) {
  const [offset, setOffset] = useState<Offset | null>(null);
  const start = useRef<{
    x: number;
    y: number;
    from: Offset;
    width: number;
    height: number;
    moved: boolean;
  } | null>(null);

  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (!active || e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
      const box = e.currentTarget.getBoundingClientRect();
      const view = viewport();
      start.current = {
        x: e.clientX,
        y: e.clientY,
        from: { right: view.width - box.right, bottom: view.height - box.bottom },
        width: box.width,
        height: box.height,
        moved: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      const s = start.current;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (!s.moved && Math.hypot(dx, dy) < 6) return;
      s.moved = true;
      const view = viewport();
      const clamp = (v: number, max: number) =>
        Math.min(Math.max(v, MINI_MARGIN), max - MINI_MARGIN);
      setOffset({
        right: clamp(s.from.right - dx, view.width - s.width),
        bottom: clamp(s.from.bottom - dy, view.height - s.height),
      });
    },
    onPointerUp: () => {
      const s = start.current;
      start.current = null;
      if (s && !s.moved) onTap();
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
  return { offset, handlers };
}

/** What fixed right/bottom measure from: the window without its scrollbar. */
const viewport = () => ({
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
});

type Rect = { top: number; left: number; width: number; height: number };

/** Where an element is in the window, following resizes and scrolling. */
function useElementRect(element: HTMLElement | null): Rect | null {
  const key = useSyncExternalStore(
    useCallback(
      listener => {
        if (!element) return () => {};
        const observer = new ResizeObserver(listener);
        observer.observe(element);
        window.addEventListener('resize', listener);
        window.addEventListener('scroll', listener, true);
        return () => {
          observer.disconnect();
          window.removeEventListener('resize', listener);
          window.removeEventListener('scroll', listener, true);
        };
      },
      [element],
    ),
    () => {
      if (!element || !element.isConnected) return null;
      const r = element.getBoundingClientRect();
      // Hidden (display:none on phones): not a place to dock.
      if (r.width === 0 || r.height === 0) return null;
      return `${r.top}|${r.left}|${r.width}|${r.height}`;
    },
    () => null,
  );
  if (!key) return null;
  const [top, left, width, height] = key.split('|').map(Number);
  return { top, left, width, height };
}

// ---- Before the call ----

function LobbyHeader({ request, onCancel }: { request: CallRequest; onCancel: () => void }) {
  const isVideo = request.callType === 'video';
  return (
    <header className="flex items-center gap-3 bg-[#611508] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-5">
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel call"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
      >
        <X className="h-6 w-6" aria-hidden />
      </button>
      <Photo photo={request.partner.photo} name={request.partner.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[18px] font-semibold">{request.partner.name}</p>
        <p className="flex items-center gap-1.5 text-[14px] text-white/80">
          {isVideo ? (
            <VideoCallIcon className="h-3.5 w-3.5" />
          ) : (
            <CallIcon className="h-3.5 w-3.5" />
          )}
          {isVideo ? 'Video call' : 'Voice call'}
        </p>
      </div>
    </header>
  );
}

function Lobby({
  stage,
  request,
  mic,
  camera,
  onMic,
  onCamera,
  onRetry,
  onJoin,
}: {
  stage: Exclude<Stage, { kind: 'call' }>;
  request: CallRequest;
  mic: boolean;
  camera: boolean;
  onMic: () => void;
  onCamera: () => void;
  onRetry: () => void;
  onJoin: () => void;
}) {
  const isVideo = request.callType === 'video';
  const preview = useRef<HTMLVideoElement>(null);
  const stream = stage.kind === 'ready' ? stage.media.stream : null;
  useEffect(() => {
    if (preview.current) preview.current.srcObject = stream;
  }, [stream]);

  if (stage.kind === 'blocked') {
    const help = mediaHelp(
      stage.problem,
      request.callType,
      platformOf(navigator.userAgent, navigator.maxTouchPoints),
    );
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          <MicOffIcon className="h-8 w-8 text-[#F8F3DF]" />
        </span>
        <h2 className="text-[20px] font-semibold">{help.title}</h2>
        <ol className="max-w-md list-decimal space-y-2 pl-5 text-left text-[15px] text-white/85">
          {help.steps.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-[#F8F3DF] px-6 py-3 text-[16px] font-semibold text-[#611508]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden /> Try again
        </button>
      </div>
    );
  }

  const ready = stage.kind === 'ready';
  const cameraProblem = ready ? stage.media.cameraProblem : null;
  const showVideo = isVideo && ready && cameraProblem === null && camera;

  return (
    <>
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
        {/* Mounted for the whole lobby so the preview never flickers; hidden when there's nothing to show. */}
        <video
          ref={preview}
          autoPlay
          playsInline
          muted
          className={clsx(
            'absolute inset-0 h-full w-full -scale-x-100 object-cover',
            !showVideo && 'invisible',
          )}
        />
        {showVideo ? null : (
          <div className="relative flex flex-col items-center gap-4 px-6 text-center">
            <Photo photo={request.partner.photo} name={request.partner.name} size="lg" />
            {stage.kind === 'checking' ? (
              <p className="flex items-center gap-2 text-[15px] text-white/80">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Checking your {isVideo ? 'camera and microphone' : 'microphone'}…
              </p>
            ) : (
              <p className="text-[15px] text-white/80">
                {cameraProblem
                  ? cameraFallbackNote(cameraProblem)
                  : isVideo
                    ? 'Your camera is off.'
                    : 'Your microphone is ready.'}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start justify-center gap-6 bg-black/40 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
        <LobbyToggle
          label={mic ? 'Mute' : 'Unmute'}
          pressed={!mic}
          disabled={!ready}
          onClick={onMic}
          icon={mic ? MicIcon : MicOffIcon}
        />
        {isVideo ? (
          <LobbyToggle
            label="Camera"
            pressed={!camera}
            disabled={!ready || cameraProblem !== null}
            onClick={onCamera}
            icon={camera ? CameraOnIcon : CameraOffIcon}
          />
        ) : null}
        <button
          type="button"
          onClick={onJoin}
          disabled={!ready}
          className="mt-0.5 flex h-14 items-center gap-2 rounded-full bg-[#15B763] px-7 text-[17px] font-semibold text-white hover:bg-[#12a157] disabled:opacity-50"
        >
          {isVideo ? <VideoCallIcon className="h-5 w-5" /> : <CallIcon className="h-5 w-5" />}
          Join call
        </button>
      </div>
    </>
  );
}

/** Another tab of this browser has a call open (the same account can only be in a call once). */
function OtherTab({ onClose, onRetry }: { onClose: () => void; onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
        <MonitorSmartphone className="h-8 w-8 text-[#F8F3DF]" aria-hidden />
      </span>
      <h2 className="text-[20px] font-semibold">A call is open in another tab</h2>
      <p className="max-w-md text-[15px] text-white/85">
        You can be in one call at a time. Go back to the other AstroSewa tab or window, or end the
        call there and try again.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-12 rounded-full bg-white/10 px-6 text-[16px] font-semibold hover:bg-white/20"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-[#F8F3DF] px-6 text-[16px] font-semibold text-[#611508]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden /> Try again
        </button>
      </div>
    </div>
  );
}

function LobbyToggle({
  label,
  icon: Icon,
  onClick,
  pressed,
  disabled,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className="flex w-16 flex-col items-center gap-2 text-[13px] font-medium text-white disabled:opacity-40"
    >
      <span
        className={clsx(
          'flex h-14 w-14 items-center justify-center rounded-full',
          pressed ? 'bg-[#F8F3DF] text-[#611508]' : 'bg-white/10 text-[#F8F3DF] hover:bg-white/20',
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      {label}
    </button>
  );
}

// ---- After the call ----

const END_TEXT: Record<CallEndReason, string> = {
  hangup: 'Call ended',
  'time-up': 'The consultation time is over',
  'other-left': 'Call ended',
  'connection-lost': 'The call dropped. Check your internet connection.',
  'other-device': 'You joined this call on another device or tab.',
  failed: 'The call could not start.',
};

function Ended({
  state,
  request,
  compact,
  onClose,
  onAgain,
}: {
  state: CallState;
  request: CallRequest;
  /** In the small window (plain endings only; the others open full). */
  compact: boolean;
  onClose: () => void;
  onAgain: () => void;
}) {
  const reason = state.endReason ?? 'hangup';
  const quiet = QUIET_ENDS.has(reason) && !state.error;
  const canRetry = reason === 'connection-lost' || reason === 'failed';
  if (compact) {
    return (
      <p
        role="status"
        className="flex flex-1 items-center justify-center px-3 text-center text-[14px] font-medium"
      >
        {state.error ?? END_TEXT[reason]}
      </p>
    );
  }
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <Photo photo={request.partner.photo} name={request.partner.name} size="lg" />
      <p className="text-[20px] font-semibold">{request.partner.name}</p>
      <p role="status" className="max-w-sm text-[16px] text-white/85">
        {state.error ?? END_TEXT[reason]}
      </p>
      {quiet ? null : (
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-full bg-white/10 px-6 text-[16px] font-semibold hover:bg-white/20"
          >
            Close
          </button>
          {canRetry ? (
            <button
              type="button"
              onClick={onAgain}
              className="h-12 rounded-full bg-[#15B763] px-6 text-[16px] font-semibold hover:bg-[#12a157]"
            >
              Call again
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
