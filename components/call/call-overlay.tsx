'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  RefreshCw,
  UserRound,
  Video,
  VideoOff,
  Volume2,
  X,
} from 'lucide-react';

import { CallIcon, VideoCallIcon } from '@/components/call/call-icons';
import type { CallRequest } from '@/components/call/call-provider';
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

/**
 * The call over the page: first the before-call screen (camera and mic check with a preview, choices, Join), then
 * the call. Step 2 of doc 08: the call view here is plain on purpose; step 3 gives it the Figma look.
 */
export default function CallOverlay({
  request,
  onClose,
}: {
  request: CallRequest;
  onClose: () => void;
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

  // Keep the page behind still while the call covers it.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const callState = useCallState(session);
  const closeLobby = () => {
    stopMedia(previewStream.current);
    previewStream.current = null;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 font-app lg:p-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${isVideo ? 'Video' : 'Voice'} call with ${request.partner.name}`}
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#16110f] text-white lg:h-[min(760px,calc(100dvh-4rem))] lg:max-w-[1100px] lg:rounded-2xl lg:shadow-2xl"
      >
        <header className="flex items-center gap-3 bg-[#611508] px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-5">
          {stage.kind === 'call' ? null : (
            <button
              type="button"
              onClick={closeLobby}
              aria-label="Cancel call"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          )}
          <PartnerPhoto photo={request.partner.photo} name={request.partner.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-semibold">{request.partner.name}</p>
            <p className="flex items-center gap-1.5 text-[14px] text-white/80">
              {isVideo ? (
                <VideoCallIcon className="h-3.5 w-3.5" />
              ) : (
                <CallIcon className="h-3.5 w-3.5" />
              )}
              {isVideo ? 'Video call' : 'Voice call'}
              {stage.kind === 'call' && callState
                ? ` · ${phaseLabel(callState, request.partner.name)}`
                : ''}
            </p>
          </div>
        </header>

        {stage.kind === 'call' ? (
          <PlainCall
            session={stage.session}
            state={callState}
            request={request}
            onClose={onClose}
          />
        ) : (
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
        )}
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

// ---- Before the call ----

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
          <MicOff className="h-8 w-8" aria-hidden />
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
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[16px] font-semibold text-[#611508]"
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
            <PartnerPhoto photo={request.partner.photo} name={request.partner.name} size="lg" />
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

      <div className="flex items-center justify-center gap-6 rounded-t-3xl bg-[#2b2522] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 lg:rounded-none">
        <RoundButton
          label={mic ? 'Mute' : 'Unmute'}
          pressed={!mic}
          disabled={!ready}
          onClick={onMic}
          icon={mic ? Mic : MicOff}
        />
        {isVideo ? (
          <RoundButton
            label={camera ? 'Camera off' : 'Camera on'}
            pressed={!camera}
            disabled={!ready || cameraProblem !== null}
            onClick={onCamera}
            icon={camera ? Video : VideoOff}
          />
        ) : null}
        <button
          type="button"
          onClick={onJoin}
          disabled={!ready}
          className="flex h-14 items-center gap-2 rounded-full bg-[#15B763] px-7 text-[17px] font-semibold text-white disabled:opacity-50"
        >
          {isVideo ? <VideoCallIcon className="h-5 w-5" /> : <CallIcon className="h-5 w-5" />}
          Join call
        </button>
      </div>
    </>
  );
}

// ---- The call (plain until step 3) ----

function PlainCall({
  session,
  state,
  request,
  onClose,
}: {
  session: CallSession;
  state: CallState | null;
  request: CallRequest;
  onClose: () => void;
}) {
  // Handed to the session once; tracks come and go inside these same elements.
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteAudio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    session.setMediaElements({
      remoteVideo: remoteVideo.current,
      localVideo: localVideo.current,
      remoteAudio: remoteAudio.current,
    });
  }, [session]);

  const ended = state?.phase === 'ended';
  const showRemoteVideo = !!state?.video && !!state.other.cameraOn && !ended;
  const showLocalVideo = !!state?.cameraOn && !ended;

  return (
    <>
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          className={clsx(
            'absolute inset-0 h-full w-full object-cover',
            !showRemoteVideo && 'invisible',
          )}
        />
        <audio ref={remoteAudio} autoPlay />
        <video
          ref={localVideo}
          autoPlay
          playsInline
          muted
          className={clsx(
            'absolute right-3 top-3 h-40 w-28 rounded-xl object-cover lg:h-48 lg:w-36',
            state?.facing !== 'environment' && '-scale-x-100',
            !showLocalVideo && 'invisible',
          )}
        />
        {showRemoteVideo ? null : (
          <div className="relative flex flex-col items-center gap-3 px-6 text-center">
            <PartnerPhoto photo={request.partner.photo} name={request.partner.name} size="lg" />
            <p className="text-[16px] text-white/85">
              {state
                ? ended
                  ? endedText(state)
                  : phaseLabel(state, request.partner.name)
                : 'Connecting…'}
            </p>
            {state?.cameraProblem && !ended ? (
              <p className="max-w-sm text-[14px] text-white/70">{state.cameraProblem}</p>
            ) : null}
          </div>
        )}
        {state?.audioBlocked && !ended ? (
          <button
            type="button"
            onClick={() => void session.startAudio()}
            className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-[#611508]"
          >
            <Volume2 className="h-4 w-4" aria-hidden /> Tap to hear {request.partner.name}
          </button>
        ) : null}
        {state?.otherStartedVideo && !ended ? (
          <div className="absolute inset-x-4 bottom-4 mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-white p-3 text-[#2b2522]">
            <p className="flex-1 text-[14px]">
              {request.partner.name} turned on video. Turn on yours?
            </p>
            <button
              type="button"
              onClick={() => session.dismissVideoOffer()}
              className="rounded-full px-3 py-1.5 text-[14px] font-medium"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={() => void session.toggleCamera()}
              className="rounded-full bg-[#611508] px-3 py-1.5 text-[14px] font-semibold text-white"
            >
              Turn on
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-6 rounded-t-3xl bg-[#2b2522] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 lg:rounded-none">
        {ended ? (
          <button
            type="button"
            onClick={onClose}
            className="h-14 rounded-full bg-white px-8 text-[17px] font-semibold text-[#611508]"
          >
            Close
          </button>
        ) : (
          <>
            <RoundButton
              label={state?.micOn ? 'Mute' : 'Unmute'}
              pressed={!state?.micOn}
              onClick={() => void session.toggleMic()}
              icon={state?.micOn ? Mic : MicOff}
            />
            <RoundButton
              label={state?.cameraOn ? 'Camera off' : 'Camera on'}
              pressed={!state?.cameraOn}
              onClick={() => void session.toggleCamera()}
              icon={state?.cameraOn ? Video : VideoOff}
            />
            {state?.cameraOn ? (
              <RoundButton
                label="Flip"
                onClick={() => void session.flipCamera()}
                icon={RefreshCw}
              />
            ) : null}
            <RoundButton label="End" danger onClick={() => void session.end()} icon={PhoneOff} />
          </>
        )}
      </div>
    </>
  );
}

function phaseLabel(state: CallState, name: string): string {
  switch (state.phase) {
    case 'idle':
    case 'connecting':
      return 'Connecting…';
    case 'waiting':
      return `Calling ${name}…`;
    case 'in-call':
      return 'In call';
    case 'reconnecting':
      return 'Reconnecting…';
    case 'ended':
      return 'Call ended';
  }
}

const END_TEXT: Record<CallEndReason, string> = {
  hangup: 'Call ended.',
  'time-up': 'The consultation time is over.',
  'other-left': 'The other person left the call.',
  'connection-lost': 'The call dropped. Check your internet connection.',
  'other-device': 'You joined this call on another device or tab.',
  failed: 'The call could not start.',
};

function endedText(state: CallState): string {
  return state.error ?? END_TEXT[state.endReason ?? 'hangup'];
}

// ---- Bits ----

function RoundButton({
  label,
  icon: Icon,
  onClick,
  pressed,
  danger,
  disabled,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  pressed?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className="flex flex-col items-center gap-1.5 text-[13px] text-white/90 disabled:opacity-40"
    >
      <span
        className={clsx(
          'flex h-14 w-14 items-center justify-center rounded-full',
          danger ? 'bg-[#FF3B3B]' : pressed ? 'bg-white text-[#2b2522]' : 'bg-white/15',
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      {label}
    </button>
  );
}

function PartnerPhoto({
  photo,
  name,
  size,
}: {
  photo: string | null;
  name: string;
  size: 'sm' | 'lg';
}) {
  const box = size === 'sm' ? 'h-10 w-10' : 'h-24 w-24';
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element -- backend media URLs (images.unoptimized on the Worker)
    <img
      src={photo}
      alt={size === 'lg' ? name : ''}
      className={clsx(box, 'shrink-0 rounded-full object-cover')}
    />
  ) : (
    <span
      className={clsx(box, 'flex shrink-0 items-center justify-center rounded-full bg-white/15')}
    >
      <UserRound className={size === 'sm' ? 'h-5 w-5' : 'h-12 w-12'} aria-hidden />
    </span>
  );
}
