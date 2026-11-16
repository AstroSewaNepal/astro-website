// The live feed list (doc 10 step 2): the app's LiveFeedScreen / LiveBrowseRoomCard rules.

import type { LiveRoomSummary } from '@/lib/live/api';

export const LIVE_FEED_POLL_MS = 15_000;

/**
 * Keeps the list in the order the person already sees (the app's `stableRooms`): rooms that are still live stay
 * where they were, new ones are added at the end, ended ones drop out. Returns `prev` itself when nothing changed
 * (same rooms, same counts), so nothing re-renders.
 */
export function stableRooms(prev: LiveRoomSummary[], next: LiveRoomSummary[]): LiveRoomSummary[] {
  const byId = new Map(next.map(r => [r.roomId, r]));
  const kept = prev.filter(r => byId.has(r.roomId)).map(r => byId.get(r.roomId)!);
  const seen = new Set(kept.map(r => r.roomId));
  const merged = [...kept, ...next.filter(r => !seen.has(r.roomId))];
  const unchanged =
    merged.length === prev.length &&
    merged.every((r, i) => {
      const p = prev[i];
      return (
        p.roomId === r.roomId &&
        p.viewerCount === r.viewerCount &&
        p.astrologerName === r.astrologerName &&
        p.astrologerAvatar === r.astrologerAvatar
      );
    });
  return unchanged ? prev : merged;
}

/** Service tags, capitalised like the app ("tarot" -> "Tarot"). */
export function cardServices(room: Pick<LiveRoomSummary, 'services'>): string[] {
  return (room.services ?? [])
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1));
}

/**
 * The line under the name: "N watching"; with nobody watching the app shows the astrologer's services instead
 * (returns null then, the card shows `cardServices`), or "0 watching" when there are none either.
 */
export function watchingLabel(room: Pick<LiveRoomSummary, 'viewerCount' | 'services'>): string | null {
  const count = room.viewerCount ?? 0;
  if (count > 0) return `${count} watching`;
  return cardServices(room).length ? null : '0 watching';
}

/** "Rs 400", "$5", "$5.50": a live call-slot price (the app's formatCallSlotPrice). */
export function formatCallSlotPrice(price: { currency: string; amount: number }): string {
  const amount = Number.isInteger(price.amount) ? String(price.amount) : price.amount.toFixed(2);
  if (price.currency === 'NPR') return `Rs ${amount}`;
  if (price.currency === 'USD') return `$${amount}`;
  return `${price.currency} ${amount}`;
}

/** The viewer page of an astrologer's stream (the app's share link carries only the astrologerId too). */
export function livePath(astrologerId: string): string {
  return `/live/${encodeURIComponent(astrologerId)}`;
}

/** Big counts like the app's live header: 1.2k, 3.4M. */
export function compactCount(n: number): string {
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim(n / 1_000)}k`;
  return String(n);
}

const trim = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, ''));
