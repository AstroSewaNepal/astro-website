'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Maximize2, Minimize2, UserRound, Volume2, WifiOff } from 'lucide-react';

import {
  CameraOffIcon,
  CameraOnIcon,
  EndCallIcon,
  FlipCameraIcon,
  MicIcon,
  MicOffIcon,
  VideoCallIcon,
} from '@/components/call/call-icons';
import type { CallRequest } from '@/components/call/call-provider';
import { formatCountdown } from '@/lib/chat/session';
import type { CallSession, CallState } from '@/lib/call/session';

/** Like the app's VideoCallView: video-call controls hide after this long without a tap. */
const CONTROLS_HIDE_MS = 20_000;

/**
 * Where the call sits (call-overlay.tsx): full screen / centred panel, beside the chat on desktop (no header bar of
 * its own: the chat shows who it is with), or the small draggable window over the page.
 */
export type CallLayout = 'full' | 'docked' | 'mini';

/**
 * The call itself, after Join (Figma Video-Call / Audio-Call / Voice-Call, the app's VideoCallView and VoiceCallView).
 * Video and audio elements are mounted once and handed to the session; only their visibility changes between the
 * voice and video layouts and the placements, so the browser never rebuilds them mid-call.
 */
export function CallScreen({
  session,
  state,
  request,
  layout,
  onMinimize,
  onExpand,
}: {
  session: CallSession;
  state: CallState;
  request: CallRequest;
  layout: CallLayout;
  onMinimize: () => void;
  onExpand: () => void;
}) {
  const docked = layout === 'docked';
  const mini = layout === 'mini';
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

  const videoLayout = state.video;
  const theirVideo = videoLayout && state.other.cameraOn;
  const myVideo = state.cameraOn;

  // Video calls: a tap shows the controls, which hide again after a while (app). Voice calls keep them.
  const [controlsShown, setControlsShown] = useState(true);
  const [pokedAt, setPokedAt] = useState(0);
  useEffect(() => {
    if (!videoLayout || !controlsShown) return;
    const t = setTimeout(() => setControlsShown(false), CONTROLS_HIDE_MS);
    return () => clearTimeout(t);
  }, [videoLayout, controlsShown, pokedAt]);
  const poke = () => {
    setControlsShown(true);
    setPokedAt(Date.now());
  };
  const controlsVisible = !videoLayout || controlsShown;

  const status = statusText(state, request.partner.name);
  // The small window: a video call is a tile (their video, or their photo while their camera is off; mine in the
  // corner, like the app's PiP), a voice call a one-line card (photo, name, status, buttons).
  const miniCard = mini && !videoLayout;
  const miniTile = mini && videoLayout;

  const minimizeButton = (
    <button
      type="button"
      onClick={onMinimize}
      aria-label="Minimize call"
      title="Minimize: keep the call in a small window"
      className={clsx(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10',
        // Voice header: the title stays centred, the button sits at its left.
        !videoLayout && 'absolute bottom-1 left-2',
      )}
    >
      <Minimize2 className="h-5 w-5" aria-hidden />
    </button>
  );

  return (
    <div
      className={clsx(
        'relative flex min-h-0 flex-1 overflow-hidden bg-[#16110f] text-white',
        miniCard ? 'flex-row items-center' : 'flex-col',
      )}
      onPointerDown={videoLayout && !mini ? poke : undefined}
    >
      {/* Voice layout (and video before their camera is on): the Figma blurred-photo backdrop. */}
      {theirVideo ? null : <Backdrop photo={request.partner.photo} />}

      <video
        ref={remoteVideo}
        autoPlay
        playsInline
        className={clsx('absolute inset-0 h-full w-full object-cover', !theirVideo && 'invisible')}
      />
      <audio ref={remoteAudio} autoPlay />

      {/* Header: phones show who it is with (Figma); beside the chat on desktop the chat header already does. */}
      {docked || mini ? null : (
        <header
          className={clsx(
            'relative z-10 flex items-center gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] transition-opacity duration-300',
            videoLayout ? 'bg-[#611508]' : 'justify-center bg-transparent',
            !controlsVisible && 'pointer-events-none opacity-0',
          )}
        >
          {videoLayout ? (
            <>
              {minimizeButton}
              <Photo photo={request.partner.photo} name={request.partner.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[18px] font-semibold">{request.partner.name}</p>
                <p className="flex items-center gap-2 text-[14px] text-white/80">
                  {status ?? 'Video call'}
                  <Countdown endsAt={state.endsAt} />
                </p>
              </div>
            </>
          ) : (
            <>
              {minimizeButton}
              <p className="text-[17px] font-semibold">Voice call</p>
            </>
          )}
        </header>
      )}

      {/* Me, top right (Figma); mirrored for the front camera like a selfie view. */}
      <video
        ref={localVideo}
        autoPlay
        playsInline
        muted
        className={clsx(
          'absolute z-10 object-cover shadow-lg',
          miniTile
            ? 'right-2 top-2 h-[72px] w-[52px] rounded-lg ring-1 ring-white/40 lg:h-[120px] lg:w-[86px]'
            : 'right-3 h-[150px] w-[105px] rounded-xl lg:h-[170px] lg:w-[130px]',
          !miniTile &&
            (docked ? 'top-3' : 'top-[calc(max(0.75rem,env(safe-area-inset-top))+4.25rem)]'),
          state.facing === 'user' && '-scale-x-100',
          (!myVideo || !videoLayout) && 'invisible',
        )}
      />

      {/* Middle: who and how long, whenever their video isn't filling the screen. */}
      <div
        className={clsx(
          'relative z-[1] flex min-h-0 min-w-0 flex-1',
          miniCard
            ? 'items-center gap-3 pl-3'
            : miniTile
              ? 'flex-col items-center justify-center gap-1.5 px-2 pb-12 text-center'
              : 'flex-col items-center justify-center gap-2 px-6 text-center',
        )}
      >
        {theirVideo ? null : miniTile ? (
          <>
            <Photo photo={request.partner.photo} name={request.partner.name} size="sm" />
            <p className="w-full truncate text-[13px] font-semibold lg:text-[15px]">
              {request.partner.name}
            </p>
            <p className="text-[12px] text-white/75 lg:text-[13px]">
              {state.audioBlocked
                ? 'Tap to hear'
                : (status ?? (state.phase === 'in-call' ? 'Camera off' : null))}
            </p>
          </>
        ) : miniCard ? (
          <>
            <Photo photo={request.partner.photo} name={request.partner.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{request.partner.name}</p>
              <p className="truncate text-[13px] text-white/80">
                {state.audioBlocked ? (
                  'Tap to hear'
                ) : status ? (
                  <span className="text-[#FFBB50]">{status}</span>
                ) : (
                  <Countdown endsAt={state.endsAt} />
                )}
              </p>
            </div>
          </>
        ) : (
          <>
            <Photo photo={request.partner.photo} name={request.partner.name} size="lg" />
            <p
              className={clsx(
                'mt-2 text-[15px] font-medium',
                state.phase === 'in-call' ? 'text-[#15B763]' : 'text-[#FFBB50]',
              )}
            >
              {status ?? 'In call'}
            </p>
            <p className="text-[22px] font-semibold">{request.partner.name}</p>
            <Countdown endsAt={state.endsAt} large />
            {videoLayout && state.phase === 'in-call' && !state.other.cameraOn ? (
              <p className="text-[14px] text-white/70">
                {request.partner.name}&apos;s camera is off
              </p>
            ) : null}
          </>
        )}
      </div>

      {/* Notices over the call. */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 px-4">
        {/* The small card says it in its status line. */}
        {state.phase === 'reconnecting' && !miniCard ? (
          <p
            className={clsx(
              'inline-flex items-center gap-2 rounded-full bg-black/70',
              mini ? 'px-2.5 py-1 text-[12px]' : 'px-4 py-2 text-[15px]',
            )}
          >
            <WifiOff className="h-4 w-4" aria-hidden /> Reconnecting…
          </p>
        ) : null}
      </div>

      {/* The small window has no room for these; a tap opens the call full. */}
      <div
        className={clsx('relative z-20 flex flex-col items-center gap-3 px-4', mini && 'hidden')}
      >
        {state.audioBlocked ? (
          <button
            type="button"
            onClick={() => void session.startAudio()}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-[#611508]"
          >
            <Volume2 className="h-4 w-4" aria-hidden /> Tap to hear {request.partner.name}
          </button>
        ) : null}
        {state.otherStartedVideo ? (
          // The app's "turn on video?" prompt when the other person switches a voice call to video.
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl bg-white p-3 text-[#2b2522] shadow-lg">
            <VideoCallIcon className="h-5 w-5 shrink-0 text-[#611508]" />
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
        {state.cameraProblem && !state.cameraOn ? (
          <p className="max-w-sm rounded-xl bg-black/60 px-3 py-2 text-center text-[13px] text-white/85">
            {state.cameraProblem}
          </p>
        ) : null}
      </div>

      {mini ? (
        <MiniControls session={session} state={state} overVideo={!miniCard} onExpand={onExpand} />
      ) : (
        <Controls
          session={session}
          state={state}
          videoLayout={videoLayout}
          visible={controlsVisible}
          docked={docked}
        />
      )}
    </div>
  );
}

/** The small window's buttons: mute, end and open full. Over their video, along the bottom. */
function MiniControls({
  session,
  state,
  overVideo,
  onExpand,
}: {
  session: CallSession;
  state: CallState;
  overVideo: boolean;
  onExpand: () => void;
}) {
  const button = (
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
    onClick: () => void,
    tone: 'plain' | 'pressed' | 'danger' = 'plain',
  ) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={tone === 'pressed' ? true : undefined}
      className={clsx(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        tone === 'danger' && 'bg-[#FF3B3B] text-[#F8F3DF] hover:bg-[#e53434]',
        tone === 'pressed' && 'bg-[#F8F3DF] text-[#611508]',
        tone === 'plain' && 'bg-white/15 text-[#F8F3DF] hover:bg-white/25',
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
  return (
    <div
      className={clsx(
        'z-20 flex items-center gap-2',
        overVideo
          ? 'absolute inset-x-0 bottom-0 justify-center bg-gradient-to-t from-black/70 to-transparent pb-2 pt-6'
          : 'relative shrink-0 pr-3',
      )}
    >
      {button(
        state.micOn ? 'Mute' : 'Unmute',
        state.micOn ? MicIcon : MicOffIcon,
        () => void session.toggleMic(),
        state.micOn ? 'plain' : 'pressed',
      )}
      {button('End call', EndCallIcon, () => void session.end(), 'danger')}
      {button('Open call', Maximize2, onExpand)}
    </div>
  );
}

function statusText(state: CallState, name: string): string | null {
  switch (state.phase) {
    case 'idle':
    case 'connecting':
      return 'Connecting…';
    case 'waiting':
      return `Calling ${name}…`;
    case 'reconnecting':
      return 'Reconnecting…';
    default:
      return null;
  }
}

/** Time left in the booking (the app's call header shows the same countdown). */
function Countdown({ endsAt, large }: { endsAt: number; large?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.floor((endsAt - now) / 1000));
  return (
    <span
      role="timer"
      aria-label={`${formatCountdown(left)} left`}
      className={clsx(
        'tabular-nums',
        large ? 'text-[16px] font-semibold' : 'text-[14px]',
        left <= 60 && 'text-[#FFBB50]',
      )}
    >
      {formatCountdown(left)}
    </span>
  );
}

function Controls({
  session,
  state,
  videoLayout,
  visible,
  docked,
}: {
  session: CallSession;
  state: CallState;
  videoLayout: boolean;
  visible: boolean;
  docked: boolean;
}) {
  const camera = (
    <Control
      label="Video"
      pressed={state.cameraOn}
      onClick={() => void session.toggleCamera()}
      icon={state.cameraOn ? CameraOnIcon : CameraOffIcon}
    />
  );
  const mic = (
    <Control
      label={state.micOn ? 'Mute' : 'Unmute'}
      pressed={!state.micOn}
      onClick={() => void session.toggleMic()}
      icon={state.micOn ? MicIcon : MicOffIcon}
    />
  );
  const end = <Control label="End" danger onClick={() => void session.end()} icon={EndCallIcon} />;

  if (!videoLayout && !docked) {
    // Figma Audio-Call (phones): Mute and Video in a row, End on its own below.
    return (
      <div className="relative z-20 flex flex-col items-center gap-10 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
        <div className="flex w-full max-w-xs justify-around">
          {mic}
          {camera}
        </div>
        {end}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative z-20 flex items-start justify-center gap-8 bg-black/40 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 backdrop-blur-sm transition-opacity duration-300 sm:gap-12',
        docked ? 'lg:pb-5' : 'rounded-t-[32px] lg:rounded-none',
        !visible && 'pointer-events-none opacity-0',
      )}
    >
      {camera}
      {mic}
      {videoLayout && state.cameraOn ? (
        <Control label="Flip" onClick={() => void session.flipCamera()} icon={FlipCameraIcon} />
      ) : null}
      {end}
    </div>
  );
}

function Control({
  label,
  icon: Icon,
  onClick,
  pressed,
  danger,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  pressed?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="flex w-16 flex-col items-center gap-2 text-[13px] font-medium text-white"
    >
      <span
        className={clsx(
          'flex h-14 w-14 items-center justify-center rounded-full',
          danger ? 'bg-[#FF3B3B] hover:bg-[#e53434]' : 'bg-white/10 hover:bg-white/20',
        )}
      >
        <Icon className="h-6 w-6 text-[#F8F3DF]" />
      </span>
      {label}
    </button>
  );
}

/** The Figma voice-call background: the person's photo, blurred and darkened. */
function Backdrop({ photo }: { photo: string | null }) {
  if (!photo) return <div className="absolute inset-0 bg-[#2b2522]" aria-hidden />;
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- backend media URLs (images.unoptimized on the Worker) */}
      <img src={photo} alt="" className="h-full w-full scale-125 object-cover blur-2xl" />
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}

export function Photo({
  photo,
  name,
  size,
}: {
  photo: string | null;
  name: string;
  size: 'sm' | 'lg';
}) {
  const box = size === 'sm' ? 'h-10 w-10' : 'h-[100px] w-[100px]';
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element -- backend media URLs (images.unoptimized on the Worker)
    <img
      src={photo}
      alt={size === 'lg' ? name : ''}
      className={clsx(box, 'shrink-0 rounded-full object-cover ring-2 ring-white/20')}
    />
  ) : (
    <span
      className={clsx(box, 'flex shrink-0 items-center justify-center rounded-full bg-white/15')}
    >
      <UserRound className={size === 'sm' ? 'h-5 w-5' : 'h-12 w-12'} aria-hidden />
    </span>
  );
}
