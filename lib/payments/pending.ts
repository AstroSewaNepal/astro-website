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
    (p.kind === 'package' || p.kind === 'plan' || p.kind === 'gift') &&
    typeof p.astrologerId === 'string' &&
    typeof p.title === 'string' &&
    isPath(p.backHref) &&
    typeof p.startedAt === 'number'
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

function write(list: PendingPayment[]) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(0, MAX_KEPT)));
  } catch {
    // Nothing to do: the return page falls back to generic wording.
  }
}

export function rememberPayment(p: PendingPayment) {
  write([p, ...read().filter(x => x.pidx !== p.pidx)]);
}

export function recallPayment(pidx: string): PendingPayment | null {
  return read().find(p => p.pidx === pidx) ?? null;
}
