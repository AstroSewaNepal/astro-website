'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { Loader2, RefreshCw, X } from 'lucide-react';

import {
  CallIcon,
  CameraOffIcon,
  CameraOnIcon,
  MicIcon,
  MicOffIcon,
  VideoCallIcon,
} from '@/components/call/call-icons';
import type { CallRequest } from '@/components/call/call-provider';
import { CallScreen, Photo } from '@/components/call/call-screen';
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

type Stage =
  | { kind: 'checking' }
  | { kind: 'ready'; media: CallMedia }
  | { kind: 'blocked'; problem: MediaProblem }
  | { kind: 'call'; session: CallSession };

/** Endings that need no explanation: the screen says so briefly and closes by itself. */
const QUIET_ENDS = new Set<CallEndReason>(['hangup', 'other-left', 'time-up']);
const QUIET_END_MS = 1_800;

/**
 * The call over the page: the before-call screen (camera and mic check with a preview, choices, Join), then the
 * call. Phones: full screen. Desktop: beside the chat when the booking's chat page is open (Figma desktop call), a
 * centred panel elsewhere. The same elements stay mounted whichever way it is placed.
 */
export default function CallOverlay({
  request,
  dock,
  onClose,
  onAgain,
}: {
  request: CallRequest;
  dock: HTMLElement | null;
  onClose: () => void;
  onAgain: () => void;
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

  // Checks right away: the tap on the chat's call button just happened, so Safari shows its prompt.
  useEffect(() => {
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
  }, [request.callType, attempt]);
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

  // Leaving the logged-in area (or logging out) unmounts this: hang up.
  const session = stage.kind === 'call' ? stage.session : null;
  useEffect(() => () => void session?.end(), [session]);
  const callState = useCallState(session);

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

  // Keep the page behind still while the call covers it (beside the chat, the chat stays usable).
  useEffect(() => {
    if (docked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [docked]);

  const closeLobby = () => {
    stopMedia(previewStream.current);
    previewStream.current = null;
    onClose();
  };

  return (
    <div
      className={clsx(
        'font-app',
        docked
          ? 'fixed z-30'
          : 'fixed inset-0 z-[70] flex items-center justify-center bg-black/60 lg:p-8',
      )}
      style={
        dockRect
          ? {
              top: dockRect.top,
              left: dockRect.left,
              width: dockRect.width,
              height: dockRect.height,
            }
          : undefined
      }
    >
      <section
        role="dialog"
        aria-modal={!docked}
        aria-label={`${isVideo ? 'Video' : 'Voice'} call with ${request.partner.name}`}
        className={clsx(
          'flex flex-col overflow-hidden bg-[#16110f] text-white',
          docked
            ? 'h-full w-full rounded-2xl shadow-[0_4px_16px_rgba(92,56,23,0.08)]'
            : 'h-[100dvh] w-full lg:h-[min(760px,calc(100dvh-4rem))] lg:max-w-[1100px] lg:rounded-2xl lg:shadow-2xl',
        )}
      >
        {stage.kind !== 'call' ? (
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
          <Ended state={callState} request={request} onClose={onClose} onAgain={onAgain} />
        ) : callState ? (
          <CallScreen session={stage.session} state={callState} request={request} docked={docked} />
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
            label={camera ? 'Camera off' : 'Camera on'}
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
  onClose,
  onAgain,
}: {
  state: CallState;
  request: CallRequest;
  onClose: () => void;
  onAgain: () => void;
}) {
  const reason = state.endReason ?? 'hangup';
  const quiet = QUIET_ENDS.has(reason) && !state.error;
  const canRetry = reason === 'connection-lost' || reason === 'failed';
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
