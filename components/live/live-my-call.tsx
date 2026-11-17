'use client';

import { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { Loader2, Mic, MicOff, PhoneOff, SwitchCamera, Video, VideoOff } from 'lucide-react';

import { useCalls } from '@/components/call/call-provider';
import { keepScreenOn } from '@/lib/call/wake-lock';
import { callTypeTitle, turnTimeText } from '@/lib/live/call-slot';
import type { LiveSession, LiveState } from '@/lib/live/session';

// My own paid call in a live stream (doc 10 step 5): the "It's your turn" window, the call's buttons, End Call, and
// coming back to a call after a reload. Everything here only asks the session to do things; the order the host sees
// (camera first, accept, publish on the same connection) lives in lib/live/session.ts.

/** Seconds until `endsAt`, ticking. */
function useSecondsLeft(endsAt: number | null): number {
  const [left, setLeft] = useState(() => (endsAt ? Math.ceil((endsAt - Date.now()) / 1000) : 0));
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setLeft(Math.ceil((endsAt - Date.now()) / 1000));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);
  return endsAt ? Math.max(0, left) : 0;
}

/**
 * While I am the caller (or joining): the screen stays on, closing or reloading the tab asks first, and the rest of
 * the site knows a live call is on (no consultation call next to it). The same guards as a consultation call.
 */
export function useLiveCallGuards(active: boolean): void {
  const { holdLiveCall } = useCalls();
  useEffect(() => {
    if (!active) return;
    const release = holdLiveCall();
    const stopWake = keepScreenOn();
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Older browsers need a value to show the prompt; the text itself is never shown.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      release();
      stopWake();
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [active, holdLiveCall]);
}

const CARD =
  'fixed left-1/2 top-1/2 z-[86] flex w-[calc(100%-48px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 flex-col gap-2.5 rounded-2xl bg-[#FFFAE6] p-5 text-center outline-none';
const PRIMARY_BUTTON =
  'flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary font-app text-[17px] font-semibold text-white disabled:opacity-60';

/**
 * The app's JoinCallModal: 60 seconds to take the call. Join Now is the tap that opens the camera (no preview
 * screen); a blocked camera or any other problem is said right here and the turn is kept while the time runs.
 */
export function LiveTurnDialog({
  open,
  onOpenChange,
  session,
  state,
  blockedReason,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: LiveSession;
  state: LiveState;
  /** Why the call can't be joined from this tab right now (a consultation call is open), or null. */
  blockedReason: string | null;
}) {
  const me = state.me;
  const called = me?.status === 'called';
  const secondsLeft = useSecondsLeft(called ? me.turnExpiresAt : null);
  const joining = state.phase === 'joining-call';
  const expired = called && secondsLeft <= 0;
  // Once the server gave me the slot the window is done; the stage shows the last moment of joining.
  if (!called) return null;

  return (
    // While joining, the window can't be closed: it is the progress.
    <DialogPrimitive.Root open={open} onOpenChange={next => (joining ? undefined : onOpenChange(next))}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[85] bg-black/65" />
        <DialogPrimitive.Content className={CARD} aria-describedby="live-turn-text">
          <DialogPrimitive.Title className="font-app text-[22px] font-semibold text-primary">It&apos;s your turn!</DialogPrimitive.Title>
          <p id="live-turn-text" className="font-app text-[15px] leading-[22px] text-[#6d6d6d]">
            Join your live consultation with the astrologer.
          </p>
          {me ? <p className="font-app text-[15px] font-semibold text-primary">{callTypeTitle(me.callType)}</p> : null}
          <p
            className={clsx('my-1 font-app text-[24px] font-semibold tabular-nums', expired ? 'text-[#6d6d6d]' : 'text-primary')}
            role="timer"
            aria-label="Time left to join"
          >
            {joining ? 'Joining...' : turnTimeText(secondsLeft)}
          </p>
          {state.error || blockedReason ? (
            <p role="alert" className="rounded-xl bg-[#fdecea] px-3 py-2 font-app text-[14px] leading-[20px] text-[#4a1a1a]">
              {state.error ?? blockedReason}
            </p>
          ) : null}
          <button
            type="button"
            className={PRIMARY_BUTTON}
            disabled={joining || expired || !!blockedReason}
            onClick={() => void session.acceptTurn()}
          >
            {joining ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
            Join Now
          </button>
          <p className="font-app text-[12px] leading-[17px] text-[#6d6d6d]">
            Your camera and microphone turn on when you join.
          </p>
          <button
            type="button"
            disabled={joining}
            onClick={() => onOpenChange(false)}
            className="self-center py-1.5 font-app text-[15px] text-[#6d6d6d] disabled:opacity-50"
          >
            Not now
          </button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** The app's EndCallModal. */
export function LiveEndCallDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[85] bg-black/65" />
        <DialogPrimitive.Content className={CARD}>
          <DialogPrimitive.Title className="font-app text-[22px] font-semibold text-primary">End consultation?</DialogPrimitive.Title>
          <DialogPrimitive.Description className="font-app text-[15px] leading-[22px] text-[#6d6d6d]">
            Are you sure you want to end the live call? Remaining time won&apos;t be saved.
          </DialogPrimitive.Description>
          <button type="button" className={clsx(PRIMARY_BUTTON, 'mt-2')} onClick={onConfirm}>
            End call
          </button>
          <DialogPrimitive.Close className="self-center py-1.5 font-app text-[15px] text-[#6d6d6d]">Cancel</DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * My call's buttons (the app's in-call column: Mic, Camera, plus Flip on phones and End). Mute and camera-off are
 * track mutes and Flip restarts the same track: nothing is ever republished mid-call.
 */
export function LiveCallControls({
  session,
  state,
  onEnd,
  row = false,
}: {
  session: LiveSession;
  state: LiveState;
  onEnd: () => void;
  row?: boolean;
}) {
  // Front/back only makes sense on phones and tablets.
  const [canFlip] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const item = clsx('flex flex-col items-center gap-0.5 font-app text-[11px] font-semibold', row ? 'text-[#4a1a1a]' : 'text-white');
  const circle = 'flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8B5E3C] bg-[#F5F0E8] text-[#8B5E3C]';
  const off = 'border-[#A5A5A5] bg-[#E6E1D8] text-[#9B9B9B]';
  return (
    <>
      <button type="button" onClick={() => void session.toggleMic()} className={item} aria-pressed={!state.micOn} aria-label={state.micOn ? 'Mute microphone' : 'Unmute microphone'}>
        <span className={clsx(circle, !state.micOn && off)}>
          {state.micOn ? <Mic className="h-6 w-6" aria-hidden /> : <MicOff className="h-6 w-6" aria-hidden />}
        </span>
        Mic
      </button>
      <button type="button" onClick={() => void session.toggleCamera()} className={item} aria-pressed={!state.cameraOn} aria-label={state.cameraOn ? 'Turn camera off' : 'Turn camera on'}>
        <span className={clsx(circle, !state.cameraOn && off)}>
          {state.cameraOn ? <Video className="h-6 w-6" aria-hidden /> : <VideoOff className="h-6 w-6" aria-hidden />}
        </span>
        Camera
      </button>
      {canFlip ? (
        <button type="button" onClick={() => void session.flipCamera()} disabled={!state.cameraOn} className={clsx(item, 'disabled:opacity-60')} aria-label="Switch camera">
          <span className={circle}>
            <SwitchCamera className="h-6 w-6" aria-hidden />
          </span>
          Flip
        </button>
      ) : null}
      <button type="button" onClick={onEnd} className={item} aria-label="End call">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#B3261E] bg-[#B3261E] text-white">
          <PhoneOff className="h-6 w-6" aria-hidden />
        </span>
        End
      </button>
    </>
  );
}

/**
 * My call slot is running on the server but this page is not in it (reloaded mid-call, or the call could not
 * start): one tap brings camera and mic back on the same connection. A tap, because browsers only open the camera
 * from one.
 */
export function LiveResumeCall({ session, state }: { session: LiveSession; state: LiveState }) {
  const joining = state.phase === 'joining-call' && state.me?.status === 'active';
  if (!joining && !(state.resumeNeeded && state.phase === 'watching')) return null;
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center">
      {joining ? (
        <>
          <Loader2 className="h-9 w-9 animate-spin text-white" aria-hidden />
          <p className="font-app text-[18px] font-semibold text-white">Joining your call...</p>
        </>
      ) : (
        <>
          <p className="font-app text-[20px] font-semibold text-white">Your call is still running</p>
          <p className="max-w-xs font-app text-[14px] text-white/80">
            {state.error ?? 'The astrologer is waiting for you. Your camera and microphone turn on when you rejoin.'}
          </p>
          <button
            type="button"
            onClick={() => void session.resumeCall()}
            className="rounded-full bg-primary px-6 py-3 font-app text-[16px] font-semibold text-white shadow-lg"
          >
            Rejoin your call
          </button>
        </>
      )}
    </div>
  );
}
