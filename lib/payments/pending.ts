// The payments this browser started, so the return page can say what was bought and where "Try again" goes.
// Only context: whether a payment went through always comes from the server. Another device or a cleared
// browser just gets the generic wording.

import type { Gateway, Purchase } from './checkout';

export type PendingPayment = {
  pidx: string;
  gateway: Gateway;
  kind: Purchase['kind'];
  astrologerId: string;
  /** "Rose", "3 Months plan", "30 min consultation" */
  title: string;
  /** Where the purchase was started, for "Try again". A path on this site. */
  backHref: string;
  startedAt: number;
  /** Live calls: the stream's room, so its viewer page can find the payment. */
  roomId?: string;
  /** Live calls: paid but not in the queue yet (it was full, or the server is still at it); the server seats the buyer. */
  awaitingSlot?: boolean;
};

export const PENDING_KEY = 'astrosewa.payments.pending';
const MAX_KEPT = 10;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isPath = (v: unknown): v is string => typeof v === 'string' && /^\/(?!\/)/.test(v);

function valid(v: unknown): v is PendingPayment {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.pidx === 'string' &&
    (p.gateway === 'esewa' || p.gateway === 'fonepay' || p.gateway === 'card') &&
    (p.kind === 'package' || p.kind === 'plan' || p.kind === 'gift' || p.kind === 'live-call') &&
    typeof p.astrologerId === 'string' &&
    typeof p.title === 'string' &&
    isPath(p.backHref) &&
    typeof p.startedAt === 'number' &&
    (p.roomId === undefined || typeof p.roomId === 'string') &&
    (p.awaitingSlot === undefined || typeof p.awaitingSlot === 'boolean')
  );
}

export function parsePending(raw: string | null, now = Date.now()): PendingPayment[] {
  if (!raw) return [];
  try {
    const list: unknown = JSON.parse(raw);
    return Array.isArray(list)
      ? list.filter(valid).filter(p => now - p.startedAt < MAX_AGE_MS)
      : [];
  } catch {
    return [];
  }
}

function read(): PendingPayment[] {
  try {
    return parsePending(window.localStorage.getItem(PENDING_KEY));
  } catch {
    return []; // private mode or blocked storage
  }
}

/** Fired on this page when the list changes (other tabs get the browser's own `storage` event). */
const CHANGED = 'astrosewa:pending-payments';

function write(list: PendingPayment[]) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(0, MAX_KEPT)));
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    // Nothing to do: the return page falls back to generic wording.
  }
}

/** For useSyncExternalStore: tells `listener` when the stored payments change, here or in another tab. */
export function subscribePending(listener: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === PENDING_KEY) listener();
  };
  window.addEventListener(CHANGED, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGED, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function rememberPayment(p: PendingPayment) {
  write([p, ...read().filter(x => x.pidx !== p.pidx)]);
}

export function recallPayment(pidx: string): PendingPayment | null {
  return read().find(p => p.pidx === pidx) ?? null;
}

/** Notes what the server said about a payment (a live call waiting for a spot, or no longer). */
export function markPayment(pidx: string, change: Pick<PendingPayment, 'awaitingSlot'>) {
  const list = read();
  const at = list.findIndex(p => p.pidx === pidx);
  if (at < 0) return;
  list[at] = { ...list[at], ...change };
  write(list);
}

/**
 * The newest live-call payment in this room that is paid but still waiting for a spot in the queue, if any.
 * A pure function of the stored list (see parsePending), for the viewer page.
 */
export function awaitingLiveCall(list: PendingPayment[], roomId: string): PendingPayment | null {
  return list.find(p => p.kind === 'live-call' && p.roomId === roomId && p.awaitingSlot === true) ?? null;
}

/** The stored list as text (a stable snapshot for useSyncExternalStore; parse it with parsePending). */
export function pendingSnapshot(): string {
  try {
    return window.localStorage.getItem(PENDING_KEY) ?? '';
  } catch {
    return '';
  }
}
