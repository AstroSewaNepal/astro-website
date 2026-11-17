import { describe, expect, it } from 'vitest';

import {
  AWAITING_SLOT_REASON,
  CALL_TYPE_OPTIONS,
  IN_CONSULTATION_REASON,
  callDisabledReason,
  callTypeTitle,
  liveCallResult,
  myQueueText,
} from '@/lib/live/call-slot';
import type { LiveMyQueue, LiveQueueInfo } from '@/lib/live/session';
import { outcomeOf, readStatus } from '@/lib/payments/checkout';

const queue = (over: Partial<LiveQueueInfo> = {}): LiveQueueInfo => ({
  waitingCount: 1,
  maxWaiting: 5,
  isFull: false,
  isQueueOpen: true,
  canPay: true,
  price: { currency: 'NPR', amount: 150 },
  ...over,
});
const me = (over: Partial<LiveMyQueue> = {}): LiveMyQueue => ({
  status: 'waiting',
  position: 2,
  callType: 'public_video',
  queueId: 'q1',
  turnExpiresAt: null,
  ...over,
});
const reason = (over: Partial<Parameters<typeof callDisabledReason>[0]> = {}) =>
  callDisabledReason({ queue: queue(), me: null, awaitingSlot: false, inConsultation: false, ...over });

describe('call types', () => {
  it('are the app rows in the app order', () => {
    expect(CALL_TYPE_OPTIONS.map(o => o.type)).toEqual(['public_video', 'public_audio', 'private_audio']);
    expect(callTypeTitle('private_audio')).toBe('Private Call');
  });
});

describe('callDisabledReason', () => {
  it('lets a viewer book when the queue is open, not full and priced', () => {
    expect(reason()).toBeNull();
    // Status not loaded yet: nothing to say, the button waits.
    expect(reason({ queue: null })).toBeNull();
  });

  it('uses the app wording for closed, full and already queued', () => {
    expect(reason({ queue: queue({ isQueueOpen: false }) })).toBe('Live Call is temporarily closed by the host');
    expect(reason({ queue: queue({ isFull: true }) })).toBe('Queue is full (5/5)');
    expect(reason({ me: me() })).toBe("You're already in the paid queue (#2)");
    expect(reason({ me: me({ status: 'called', position: null }) })).toBe("You're already in the paid queue");
  });

  it('a consultation call or a paid spot waiting come first', () => {
    expect(reason({ inConsultation: true, me: me() })).toBe(IN_CONSULTATION_REASON);
    expect(reason({ awaitingSlot: true, queue: queue({ isFull: true }) })).toBe(AWAITING_SLOT_REASON);
  });

  it('refuses without a price (the server only takes the price shown)', () => {
    expect(reason({ queue: queue({ price: null }) })).toMatch(/price/);
  });
});

describe('myQueueText', () => {
  it('says where I am', () => {
    expect(myQueueText(null)).toBeNull();
    expect(myQueueText(me())).toBe('You are #2 in the queue');
    expect(myQueueText(me({ status: 'called' }))).toBe("It's your turn — join your call");
    expect(myQueueText(me({ status: 'active' }))).toBe('You are currently on call');
  });
});

describe('liveCallResult', () => {
  const verdict = (status: string, fulfilment: Record<string, unknown> | null) => {
    const s = readStatus({ pidx: 'p', status, purpose: 'live-call', fulfilment });
    return liveCallResult(outcomeOf(s), s, 'Rowisee');
  };

  it('seated: the place in line from the server', () => {
    expect(verdict('Completed', { status: 'done', resultId: 'q1', reference: '3' })).toEqual({
      tone: 'good',
      title: "You're in the queue!",
      text: 'You are #3 for Rowisee',
    });
    expect(verdict('Completed', { status: 'done', resultId: 'q1' }).text).toBe("You're in Rowisee's queue");
  });

  it('paid while full, still seating, failed, not paid', () => {
    expect(verdict('Completed', { status: 'awaiting-slot', message: 'Queue is full (5/5)' }).title).toBe(
      'Payment confirmed — queue is full',
    );
    expect(verdict('Completed', { status: 'running' }).text).toBe("We're adding you to the queue.");
    const failed = verdict('Completed', { status: 'failed', message: 'You have been removed from this stream' });
    expect(failed.tone).toBe('bad');
    expect(failed.text).toMatch(/^You have been removed from this stream\. Please contact support/);
    expect(verdict('User canceled', null)).toMatchObject({ tone: 'bad', title: 'Payment not completed' });
  });
});
