// Messages that came in after the history was loaded, and own messages still on their way. Kept apart from the
// history query so a live message never needs a refetch of every loaded page.

import type { ChatItem } from '@/lib/chat/messages';

export type Outgoing = {
  localId: string;
  text: string;
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
};

export type LiveAction =
  | { type: 'arrived'; items: ChatItem[] }
  | { type: 'queued'; message: Outgoing }
  | { type: 'sent'; localId: string; item: ChatItem }
  | { type: 'failed'; localId: string; error: string; uncertain?: boolean }
  | { type: 'retry'; localId: string; at: Date }
  | { type: 'discard'; localId: string };

export const emptyLive: LiveState = { arrived: [], outbox: [] };

/** A timed-out send counts as delivered when the server has an own message with its text from this long before. */
const UNCERTAIN_MATCH_MS = 2 * 60_000;

function addArrived(arrived: ChatItem[], items: ChatItem[]): ChatItem[] {
  const known = new Set(arrived.map(m => m.id));
  const fresh = items.filter(m => {
    if (known.has(m.id)) return false;
    known.add(m.id);
    return true;
  });
  return fresh.length ? [...arrived, ...fresh] : arrived;
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
            m.text === o.text &&
            m.at.getTime() >= o.at.getTime() - UNCERTAIN_MATCH_MS,
        );
        if (!match) return true;
        used.add(match.id);
        return false;
      });
      return arrived === state.arrived && outbox.length === state.outbox.length
        ? state
        : { arrived, outbox };
    }
    case 'queued':
      return { ...state, outbox: [...state.outbox, action.message] };
    case 'sent':
      return {
        arrived: addArrived(state.arrived, [{ ...action.item, mine: true }]),
        outbox: state.outbox.filter(o => o.localId !== action.localId),
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
  const seen = new Set<string>();
  const confirmed: ChatItem[] = [];
  for (const m of [...history, ...live.arrived]) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    confirmed.push(m);
  }
  confirmed.sort((a, b) => a.at.getTime() - b.at.getTime());
  const pending = live.outbox.map<ChatItem>(o => ({
    id: o.localId,
    text: o.text,
    image: null,
    at: o.at,
    mine: true,
    status: o.status,
    error: o.error,
  }));
  return [...confirmed, ...pending];
}
