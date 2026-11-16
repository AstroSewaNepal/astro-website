// Small pure helpers for the live viewer screen (doc 10 step 3): the app's wording and the swipe/arrow rules.

import type { LiveRoomSummary } from '@/lib/live/api';
import type { LiveCallType } from '@/lib/live/messages';

const CALL_MODE_LABELS: Record<LiveCallType, string> = {
  public_video: 'public video call',
  public_audio: 'public audio call',
  private_audio: 'private audio call',
};

/** The app's banner under the header: who is in a call with the host (resolveActiveCallBannerText). */
export function callBannerText(
  mode: LiveCallType | null,
  callerName: string | null,
  perspective: 'viewer' | 'caller',
): string | null {
  if (!mode) return null;
  if (perspective === 'caller') return `In ${CALL_MODE_LABELS[mode]}`;
  if (mode === 'private_audio') return 'Private audio call in progress';
  return `In ${CALL_MODE_LABELS[mode]} with ${callerName?.trim() || 'Caller'}`;
}

/** "9:05" from seconds (the app's formatSlotCountdown). */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** The app's countdown pill colours: urgent under a minute, warning under five. */
export function countdownTone(secondsLeft: number): 'normal' | 'warning' | 'urgent' {
  if (secondsLeft <= 60) return 'urgent';
  if (secondsLeft <= 300) return 'warning';
  return 'normal';
}

/** The rooms before and after this astrologer's in the live list (null at the ends; nothing wraps around). */
export function neighbours(
  rooms: LiveRoomSummary[],
  astrologerId: string,
): { prev: LiveRoomSummary | null; next: LiveRoomSummary | null; index: number } {
  const index = rooms.findIndex(r => r.astrologerId === astrologerId);
  if (index < 0) return { prev: null, next: null, index };
  return { prev: rooms[index - 1] ?? null, next: rooms[index + 1] ?? null, index };
}

export type SwipePoint = { x: number; y: number; t: number };

/**
 * A finger moved from `start` to `end`: "up" means the next stream, "down" the previous one (the app's vertical
 * swipe feed). Needs a clear vertical move: at least 60 px, more vertical than horizontal, within 800 ms.
 */
export function swipeDirection(start: SwipePoint, end: SwipePoint): 'up' | 'down' | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (end.t - start.t > 800) return null;
  if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx) * 1.5) return null;
  return dy < 0 ? 'up' : 'down';
}

/** Chat and gifts in one list, oldest first, for the feed. */
export type LiveFeedItem =
  | { kind: 'comment'; id: string; name: string; text: string; sentAt: string; isHost: boolean; senderId: string }
  | { kind: 'gift'; id: string; name: string; giftTitle: string; sentAt: string; giftImageUrl?: string };

export function feedItems(
  messages: { messageId: string; senderId: string; senderName: string; text: string; sentAt: string }[],
  gifts: { id: string; senderName: string; giftTitle: string; sentAt: string; giftImageUrl?: string }[],
  hostId: string,
): LiveFeedItem[] {
  const items: LiveFeedItem[] = [
    ...messages.map(m => ({
      kind: 'comment' as const,
      id: m.messageId,
      name: firstWord(m.senderName),
      text: m.text,
      sentAt: m.sentAt,
      isHost: m.senderId === hostId,
      senderId: m.senderId,
    })),
    ...gifts.map(g => ({
      kind: 'gift' as const,
      id: g.id,
      name: firstWord(g.senderName),
      giftTitle: g.giftTitle,
      sentAt: g.sentAt,
      ...(g.giftImageUrl ? { giftImageUrl: g.giftImageUrl } : {}),
    })),
  ];
  return items.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}

export function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0] || 'Viewer';
}
