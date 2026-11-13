// Messages that came in after the history was loaded, and own messages still on their way. Kept apart from the
// history query so a live message never needs a refetch of every loaded page.

import { newerCopy, sameContent, type ChatItem } from '@/lib/chat/messages';

/** A photo on its way: shown from the device until the server has it. */
export type OutgoingImage = {
  /** The picked file (shrunk again on a retry: cheap, and nothing big is kept twice). */
  file: File;
  /** Object URL of the file for the pending bubble (the hook revokes it once the bubble is gone). */
  preview: string;
  /** Set once uploaded, so a retry only resends the message (the socket's answer carries just the media id). */
  uploaded?: Uploaded;
};

export type Uploaded = { mediaId: string; image: string | null; fullImage: string | null };

export type Outgoing = {
  localId: string;
  text: string;
  image?: OutgoingImage;
  /** When it was written (sorting only; the server's time replaces it once confirmed). */
  at: Date;
  status: 'sending' | 'failed';
  error?: string;
  /**
   * The send timed out, so the server may have saved it after all. The next history sync drops this copy when an
   * own message with the same text shows up.
   */
  uncertain?: boolean;
};

export type LiveState = {
  arrived: ChatItem[];
  outbox: Outgoing[];
  /**
   * Updates to messages already shown (the socket's message_edited: a call message going from started to ongoing to
   * ended). Applied to loaded messages only; one on an older page that isn't loaded shows when that page loads.
   */
  edits: Record<string, ChatItem>;
};

export type LiveAction =
  | { type: 'arrived'; items: ChatItem[] }
  | { type: 'edited'; item: ChatItem }
  | { type: 'queued'; message: Outgoing }
  | { type: 'sent'; localId: string; item: ChatItem }
  | { type: 'uploaded'; localId: string; uploaded: Uploaded }
  | { type: 'failed'; localId: string; error: string; uncertain?: boolean }
  | { type: 'retry'; localId: string; at: Date }
  | { type: 'discard'; localId: string };

export const emptyLive: LiveState = { arrived: [], outbox: [], edits: {} };

/** A timed-out send counts as delivered when the server has an own message with its text from this long before. */
const UNCERTAIN_MATCH_MS = 2 * 60_000;

/** New messages at the end; a newer copy of one already here (a resync after missed updates) replaces it. */
function addArrived(arrived: ChatItem[], items: ChatItem[]): ChatItem[] {
  let next = arrived;
  const at = new Map(arrived.map((m, i) => [m.id, i]));
  for (const item of items) {
    const i = at.get(item.id);
    if (i === undefined) {
      at.set(item.id, next.length);
      next = [...next, item];
      continue;
    }
    const shown = newerCopy(next[i], item);
    if (shown === next[i] || sameContent(shown, next[i])) continue;
    next = next.slice();
    next[i] = shown;
  }
  return next;
}

export function liveReducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case 'arrived': {
      const arrived = addArrived(state.arrived, action.items);
      const own = action.items.filter(m => m.mine);
      const used = new Set<string>();
      // Each server message may stand in for one timed-out copy only.
      const outbox = state.outbox.filter(o => {
        if (!o.uncertain || o.status !== 'failed') return true;
        const match = own.find(
          m =>
            !used.has(m.id) &&
            // A photo is matched by its upload, text by its words.
            (o.image
              ? !!o.image.uploaded && m.mediaId === o.image.uploaded.mediaId
              : m.text === o.text) &&
            m.at.getTime() >= o.at.getTime() - UNCERTAIN_MATCH_MS,
        );
        if (!match) return true;
        used.add(match.id);
        return false;
      });
      return arrived === state.arrived && outbox.length === state.outbox.length
        ? state
        : { ...state, arrived, outbox };
    }
    case 'edited': {
      const known = state.edits[action.item.id];
      const shown = known ? newerCopy(known, action.item) : action.item;
      if (known && (shown === known || sameContent(shown, known))) return state;
      return { ...state, edits: { ...state.edits, [action.item.id]: shown } };
    }
    case 'queued':
      return { ...state, outbox: [...state.outbox, action.message] };
    case 'sent':
      return {
        ...state,
        arrived: addArrived(state.arrived, [{ ...action.item, mine: true }]),
        outbox: state.outbox.filter(o => o.localId !== action.localId),
      };
    case 'uploaded':
      return {
        ...state,
        outbox: state.outbox.map(o =>
          o.localId === action.localId && o.image
            ? { ...o, image: { ...o.image, uploaded: action.uploaded } }
            : o,
        ),
      };
    case 'failed':
      return {
        ...state,
        outbox: state.outbox.map(o =>
          o.localId === action.localId
            ? { ...o, status: 'failed', error: action.error, uncertain: !!action.uncertain }
            : o,
        ),
      };
    case 'retry': {
      const message = state.outbox.find(o => o.localId === action.localId);
      if (!message) return state;
      // A retried message goes back to the end, as if written now.
      return {
        ...state,
        outbox: [
          ...state.outbox.filter(o => o.localId !== action.localId),
          { ...message, at: action.at, status: 'sending', error: undefined, uncertain: false },
        ],
      };
    }
    case 'discard':
      return { ...state, outbox: state.outbox.filter(o => o.localId !== action.localId) };
  }
}

/**
 * Everything to show, oldest first: history and live messages once each (a live message is also in the history
 * after a refetch), then own messages that aren't confirmed yet, in the order they were written.
 */
export function timeline(history: ChatItem[], live: LiveState): ChatItem[] {
  const byId = new Map<string, ChatItem>();
  for (const m of [...history, ...live.arrived]) {
    const known = byId.get(m.id);
    byId.set(m.id, known ? newerCopy(known, m) : m);
  }
  for (const [id, edit] of Object.entries(live.edits)) {
    const known = byId.get(id);
    if (known) byId.set(id, newerCopy(known, { ...edit, mine: known.mine }));
  }
  const confirmed = [...byId.values()];
  confirmed.sort((a, b) => a.at.getTime() - b.at.getTime());
  const pending = live.outbox.map<ChatItem>(o => ({
    id: o.localId,
    text: o.text,
    image: o.image?.preview ?? null,
    at: o.at,
    mine: true,
    status: o.status,
    error: o.error,
  }));
  return [...confirmed, ...pending];
}
