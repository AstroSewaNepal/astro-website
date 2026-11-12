// A consultation's time window in the chat, as the app's useChatDetails + ChatTimer (ap src/hooks, src/components).

import { clockTime } from '@/lib/booking/consultations';

export type SessionPhase = 'not-started' | 'active' | 'ended';

type Window = { scheduledStartAt: string; scheduledEndAt: string; status?: string };

/** A completed (ended by someone) or cancelled booking is over whatever the clock says. */
const CLOSED = new Set(['COMPLETED', 'CANCELLED']);

export function sessionPhase(b: Window, now: number): SessionPhase {
  if (b.status && CLOSED.has(b.status)) return 'ended';
  if (now < new Date(b.scheduledStartAt).getTime()) return 'not-started';
  if (now >= new Date(b.scheduledEndAt).getTime()) return 'ended';
  return 'active';
}

/** setTimeout's ceiling (about 24.8 days); longer waits re-check when it fires. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/** Milliseconds until the phase changes by the clock (start or end), or null when it won't. */
export function msUntilNextPhase(b: Window, now: number): number | null {
  const phase = sessionPhase(b, now);
  const at =
    phase === 'not-started'
      ? new Date(b.scheduledStartAt).getTime()
      : phase === 'active'
        ? new Date(b.scheduledEndAt).getTime()
        : null;
  return at === null ? null : Math.min(Math.max(0, at - now), MAX_TIMEOUT_MS);
}

export function secondsLeft(endAt: string, now: number): number {
  return Math.max(0, Math.floor((new Date(endAt).getTime() - now) / 1000));
}

/** "4:05", or "1:04:05" from an hour up (the app's ChatTimer). */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** Green above 5 minutes, amber from 2 to 5, red under 2 (the app's ChatTimer). */
export function countdownTone(seconds: number): 'calm' | 'soon' | 'urgent' {
  if (seconds > 300) return 'calm';
  if (seconds >= 120) return 'soon';
  return 'urgent';
}

/** The app's chat:consultationScheduled. */
export function notAvailableText(b: Window): string {
  const date = new Date(b.scheduledStartAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `The consultation is scheduled for ${date} from ${clockTime(b.scheduledStartAt)} to ${clockTime(b.scheduledEndAt)} and is not available.`;
}
