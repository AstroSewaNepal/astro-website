// Coming back to a live stream from eSewa or the card page (the tab left the stream to pay).
//
// When the purchase went through, the payment return page doesn't stop to show a result: it sends the buyer straight
// back to the stream (like the app, whose payment sheet sits on top of the stream) and leaves this note, so the
// stream says what happened as a toast and, for a gift, lets the buyer's own gift fly (lib/live/gifts findOwnGift).
// Per tab (sessionStorage), read once, and only by that astrologer's stream within a minute.

export type LiveReturnNote =
  | { kind: 'gift'; astrologerId: string; giftTitle: string | null; since: number; at: number }
  | { kind: 'live-call'; astrologerId: string; position: number | null; at: number };

export const LIVE_RETURN_KEY = 'astrosewa.live.returned';
export const LIVE_RETURN_MAX_AGE_MS = 60_000;

export function leaveLiveReturnNote(note: LiveReturnNote): void {
  try {
    window.sessionStorage.setItem(LIVE_RETURN_KEY, JSON.stringify(note));
  } catch {
    // Blocked storage: the stream just opens without the toast.
  }
}

/** The note for this astrologer's stream if there is a fresh one (pure, for tests). */
export function parseLiveReturnNote(raw: string | null, astrologerId: string, now = Date.now()): LiveReturnNote | null {
  if (!raw) return null;
  try {
    const n = JSON.parse(raw) as Record<string, unknown>;
    if (!n || typeof n !== 'object' || n.astrologerId !== astrologerId || typeof n.at !== 'number') return null;
    if (now - n.at < 0 || now - n.at > LIVE_RETURN_MAX_AGE_MS) return null;
    if (n.kind === 'gift' && typeof n.since === 'number' && (n.giftTitle === null || typeof n.giftTitle === 'string'))
      return { kind: 'gift', astrologerId, giftTitle: n.giftTitle, since: n.since, at: n.at };
    if (n.kind === 'live-call' && (n.position === null || typeof n.position === 'number'))
      return { kind: 'live-call', astrologerId, position: n.position, at: n.at };
    return null;
  } catch {
    return null;
  }
}

/** Reads and removes the note if it is for this astrologer's stream (another stream leaves it; it goes stale). */
export function takeLiveReturnNote(astrologerId: string): LiveReturnNote | null {
  try {
    const raw = window.sessionStorage.getItem(LIVE_RETURN_KEY);
    const note = parseLiveReturnNote(raw, astrologerId);
    if (note) window.sessionStorage.removeItem(LIVE_RETURN_KEY);
    return note;
  } catch {
    return null;
  }
}
