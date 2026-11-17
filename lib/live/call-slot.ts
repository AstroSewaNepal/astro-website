// The paid live call, viewer side (doc 10 step 4): the app's wording for the call types, why Call is off, the
// queue line, and what a payment's verdict means for the viewer. Pure, so it is tested without a page.

import type { LiveCallType } from '@/lib/live/messages';
import type { LiveMyQueue, LiveQueueInfo } from '@/lib/live/session';
import { NOT_PAID_MESSAGE, type Outcome, type PurchaseStatus } from '@/lib/payments/checkout';

export const CALL_SLOT_MINUTES = 10;

export type CallTypeOption = { type: LiveCallType; title: string; subtitle: string; emoji: string };

/** The app's CallSlotSheet rows, same order and words. */
export const CALL_TYPE_OPTIONS: CallTypeOption[] = [
  {
    type: 'public_video',
    title: 'Public Video Call',
    subtitle: 'Video & Voice, Viewers can hear and see',
    emoji: '🎥',
  },
  {
    type: 'public_audio',
    title: 'Public Audio Call',
    subtitle: 'Voice and video for you and host, viewers can only hear',
    emoji: '🔊',
  },
  {
    type: 'private_audio',
    title: 'Private Call',
    subtitle: 'Private Call for you and host, viewers cannot see or hear',
    emoji: '🔒',
  },
];

export function callTypeTitle(type: LiveCallType): string {
  return CALL_TYPE_OPTIONS.find(o => o.type === type)?.title ?? type;
}

export const AWAITING_SLOT_REASON = "Payment confirmed — you'll join the queue automatically when a spot opens";
export const IN_CONSULTATION_REASON = "You're in a consultation call. Live calls open again when it ends.";

/**
 * Why this viewer can't book a call now, or null when they can (the app's getJoinQueueDisabledReason, plus the
 * web's guards). Null too while the queue status hasn't loaded: the button just waits then.
 */
export function callDisabledReason({
  queue,
  me,
  awaitingSlot,
  inConsultation,
}: {
  queue: LiveQueueInfo | null;
  me: LiveMyQueue | null;
  /** This browser paid for this room while the queue was full. */
  awaitingSlot: boolean;
  /** A consultation call (or its before-call screen) is open on this site. */
  inConsultation: boolean;
}): string | null {
  if (inConsultation) return IN_CONSULTATION_REASON;
  if (me) return `You're already in the paid queue${me.position ? ` (#${me.position})` : ''}`;
  if (awaitingSlot) return AWAITING_SLOT_REASON;
  if (!queue) return null;
  if (!queue.isQueueOpen) return 'Live Call is temporarily closed by the host';
  if (queue.isFull) return `Queue is full (${queue.maxWaiting}/${queue.maxWaiting})`;
  if (!queue.price) return 'The call price is not available yet. Try again in a moment.';
  return null;
}

/** The viewer's own line about the queue (the app's HostQueueSheet wording), or null when not in it. */
export function myQueueText(me: LiveMyQueue | null): string | null {
  if (!me) return null;
  if (me.status === 'waiting') return me.position ? `You are #${me.position} in the queue` : "You're in the queue";
  if (me.status === 'called') return "It's your turn — join your call";
  return 'You are currently on call';
}

/** What to tell the viewer once a call payment has a verdict while they stay on the stream (Fonepay in page). */
export type LiveCallResult = { tone: 'good' | 'info' | 'bad'; title: string; text: string };

export function liveCallResult(outcome: Outcome, status: PurchaseStatus, astrologerName: string): LiveCallResult {
  switch (outcome) {
    case 'done': {
      const position = Number(status.fulfilment?.reference);
      return {
        tone: 'good',
        title: "You're in the queue!",
        text: Number.isFinite(position) && position > 0
          ? `You are #${position} for ${astrologerName}`
          : `You're in ${astrologerName}'s queue`,
      };
    }
    case 'awaitingSlot':
      return {
        tone: 'info',
        title: 'Payment confirmed — queue is full',
        text: "You'll be added automatically as soon as a spot opens.",
      };
    case 'processing':
    case 'waiting':
      return { tone: 'info', title: 'Payment received', text: "We're adding you to the queue." };
    case 'deliveryFailed':
      return {
        tone: 'bad',
        title: 'Payment received, not added to the queue',
        text: `${status.fulfilment?.message ? `${status.fulfilment.message.replace(/\.?$/, '.')} ` : ''}Please contact support; your payment is safe.`,
      };
    case 'notPaid':
      return { tone: 'bad', title: 'Payment not completed', text: NOT_PAID_MESSAGE };
  }
}
