// Gifts inside a live stream (doc 10 step 6): what to say after paying in page, and which gifts fly.
//
// Fly-once rule (the app's live-gift-animated-ids, LiveStreaming Docs 15): only gifts that arrived while watching
// (`origin: 'live'`) fly, each id once per tab. History copies from the room's metadata show in the chat but never
// fly, so a late join, a room switch or a remount can't replay old gifts.

import type { LiveCallResult } from './call-slot';
import type { LiveGift } from './messages';
import { NOT_PAID_MESSAGE, type Outcome } from '@/lib/payments/checkout';

/** At most this many gifts fly at once; the rest wait their turn (the app's MAX_CONCURRENT). */
export const MAX_FLOATS = 4;
export const FLOAT_MS = 4000;

const flown = new Set<string>();

export function hasFlown(id: string): boolean {
  return flown.has(id);
}

export function markFlown(id: string): void {
  flown.add(id);
}

/** For tests. */
export function resetFlown(): void {
  flown.clear();
}

/** Gifts that should start flying now: live ones not flown yet and not already waiting or flying here. */
export function giftsToFly(gifts: LiveGift[], here: ReadonlySet<string>): LiveGift[] {
  return gifts.filter(g => g.origin === 'live' && !flown.has(g.id) && !here.has(g.id));
}

export type FloatPath = { x: number; swayAmp: number; swayFreq: number; swayPhase: number; drift: number; rotAmp: number; rotPhase: number; scale: number; rise: number };

/** A random path per gift, so no two trace the same line (the app's numbers). `spread` and `rise` are in px. */
export function floatPath(spread: number, rise: number, rand: () => number = Math.random): FloatPath {
  const r = (min: number, max: number) => min + rand() * (max - min);
  return {
    x: r(-spread, spread),
    rise: rise * r(0.88, 1.04),
    swayAmp: r(18, 56),
    swayFreq: r(2, 3.4),
    swayPhase: r(0, Math.PI * 2),
    drift: r(-28, 28),
    rotAmp: r(8, 20),
    rotPhase: r(0, Math.PI * 2),
    scale: r(0.9, 1.3),
  };
}

/** The path as Web Animations keyframes: rise with ease-out, sway, a little spin, pop in, fade out at the end. */
export function floatKeyframes(p: FloatPath, steps = 24): Keyframe[] {
  const frames: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const offset = i / steps;
    const t = 1 - (1 - offset) * (1 - offset); // ease-out quad, like the app
    const y = -p.rise * t;
    const x = p.x + Math.sin(t * Math.PI * p.swayFreq + p.swayPhase) * p.swayAmp + p.drift * t;
    const rotate = Math.sin(t * Math.PI * 2 + p.rotPhase) * p.rotAmp;
    const scale = offset < 0.08 ? p.scale * (offset / 0.08) : p.scale;
    const fadeFrom = 1 - 850 / FLOAT_MS;
    const opacity = offset < 0.04 ? offset / 0.04 : offset > fadeFrom ? (1 - offset) / (1 - fadeFrom) : 1;
    frames.push({
      offset,
      opacity: round(opacity),
      transform: `translate(${round(x)}px, ${round(y)}px) rotate(${round(rotate)}deg) scale(${round(scale)})`,
    });
  }
  return frames;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** What a gift paid by Fonepay on the stream came to, as the stream's toast. */
export function liveGiftResult(outcome: Outcome, giftTitle: string, astrologerName: string): LiveCallResult {
  switch (outcome) {
    case 'done':
      return { tone: 'good', title: 'Gift sent!', text: `${giftTitle} sent to ${astrologerName}.` };
    case 'processing':
    case 'awaitingSlot':
      return { tone: 'info', title: 'Payment received', text: `Your ${giftTitle} is on its way to ${astrologerName}.` };
    case 'deliveryFailed':
      return { tone: 'bad', title: 'Payment received, gift not sent', text: 'Please contact support; your payment is safe.' };
    case 'notPaid':
      return { tone: 'bad', title: 'Payment not completed', text: NOT_PAID_MESSAGE };
    case 'waiting':
      return {
        tone: 'info',
        title: 'Payment not confirmed yet',
        text: 'If money was deducted, check My Payments before trying again.',
      };
  }
}
