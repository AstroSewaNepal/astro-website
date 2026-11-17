// Live streams: the messages that travel inside a LiveKit room (doc 10). The shapes are the app's
// (ap types/live-stream.ts + ap docs/LiveStreaming Docs/05-data-messages-reference.md): the backend sends every
// message but `chat:message`, which any participant publishes itself. Chat history and gifts come back to late
// joiners through the room's metadata, which only the host's app writes (`liveChat.messages`, `liveChat.gifts`).

export type LiveCallType = 'public_video' | 'public_audio' | 'private_audio';

export const LIVE_CALL_TYPES: LiveCallType[] = ['public_video', 'public_audio', 'private_audio'];

/** The app's caps (ap src/screens/Live/constants/live-chat.constants.ts). */
export const MAX_CHAT_MESSAGES = 15;
export const MAX_CHAT_TEXT_LENGTH = 500;
export const MAX_GIFTS = 5;

export type LiveChatMessage = {
  type: 'chat:message';
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: string;
};

export type LiveGiftMessage = {
  type: 'gift:sent';
  giftTitle: string;
  senderName: string;
  senderId?: string;
  sentAt: string;
  giftImageUrl?: string;
};

export type LiveDataMessage =
  | { type: 'queue:update'; waitingCount: number; positions: Record<string, number> }
  | { type: 'queue:your-turn-prompt'; queueId: string; callType: LiveCallType; expiresAt: string }
  | { type: 'queue:accepted'; token: string; liveKitUrl: string; callType: LiveCallType; kickAt: string }
  | { type: 'call-mode:active'; callType: LiveCallType; callerId: string; callerName?: string; kickAt: string }
  | { type: 'call-mode:cleared' }
  | { type: 'queue:no-show'; userId: string }
  | { type: 'queue:open-changed'; isQueueOpen: boolean }
  | { type: 'room:ended' }
  | { type: 'participant:kicked' }
  | { type: 'react:sync'; likeCount: number }
  | LiveGiftMessage
  | LiveChatMessage;

type Raw = Record<string, unknown>;

const str = (v: unknown): v is string => typeof v === 'string';
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const callType = (v: unknown): v is LiveCallType => str(v) && (LIVE_CALL_TYPES as string[]).includes(v);

/** The message, or null when it is not one of ours or is missing a field we need. */
export function parseLiveMessage(value: unknown): LiveDataMessage | null {
  if (!value || typeof value !== 'object') return null;
  const m = value as Raw;
  switch (m.type) {
    case 'queue:update': {
      const positions: Record<string, number> = {};
      if (m.positions && typeof m.positions === 'object') {
        for (const [id, pos] of Object.entries(m.positions as Raw)) if (num(pos)) positions[id] = pos;
      }
      return { type: 'queue:update', waitingCount: num(m.waitingCount) ? m.waitingCount : 0, positions };
    }
    case 'queue:your-turn-prompt':
      return str(m.queueId) && callType(m.callType) && str(m.expiresAt)
        ? { type: 'queue:your-turn-prompt', queueId: m.queueId, callType: m.callType, expiresAt: m.expiresAt }
        : null;
    case 'queue:accepted':
      return str(m.token) && str(m.liveKitUrl) && callType(m.callType) && str(m.kickAt)
        ? { type: 'queue:accepted', token: m.token, liveKitUrl: m.liveKitUrl, callType: m.callType, kickAt: m.kickAt }
        : null;
    case 'call-mode:active':
      return callType(m.callType) && str(m.callerId) && str(m.kickAt)
        ? {
            type: 'call-mode:active',
            callType: m.callType,
            callerId: m.callerId,
            kickAt: m.kickAt,
            ...(str(m.callerName) ? { callerName: m.callerName } : {}),
          }
        : null;
    case 'call-mode:cleared':
    case 'room:ended':
    case 'participant:kicked':
      return { type: m.type };
    case 'queue:no-show':
      return str(m.userId) ? { type: 'queue:no-show', userId: m.userId } : null;
    case 'queue:open-changed':
      return { type: 'queue:open-changed', isQueueOpen: m.isQueueOpen === true };
    case 'react:sync':
      return num(m.likeCount) ? { type: 'react:sync', likeCount: m.likeCount } : null;
    case 'gift:sent':
      return str(m.giftTitle) && str(m.senderName) && str(m.sentAt)
        ? {
            type: 'gift:sent',
            giftTitle: m.giftTitle,
            senderName: m.senderName,
            sentAt: m.sentAt,
            ...(str(m.senderId) ? { senderId: m.senderId } : {}),
            ...(str(m.giftImageUrl) ? { giftImageUrl: m.giftImageUrl } : {}),
          }
        : null;
    case 'chat:message':
      return chatMessage(m);
    default:
      return null;
  }
}

function chatMessage(m: Raw): LiveChatMessage | null {
  if (!str(m.messageId) || !str(m.senderId) || !str(m.senderName) || !str(m.text) || !str(m.sentAt)) return null;
  const text = sanitizeChatText(m.text);
  if (!text) return null;
  return { type: 'chat:message', messageId: m.messageId, senderId: m.senderId, senderName: m.senderName, text, sentAt: m.sentAt };
}

/** A LiveKit data packet -> message (null for anything that isn't ours). */
export function decodeLiveMessage(payload: Uint8Array): LiveDataMessage | null {
  try {
    return parseLiveMessage(JSON.parse(new TextDecoder().decode(payload)));
  } catch {
    return null;
  }
}

export function encodeLiveMessage(message: LiveDataMessage): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(message));
}

export function sanitizeChatText(text: string): string {
  return text.trim().slice(0, MAX_CHAT_TEXT_LENGTH);
}

/** The app's id shape: `<senderId>-<time>-<random>`. */
export function newChatMessageId(senderId: string, now = Date.now()): string {
  return `${senderId}-${now}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Gifts as shown in the room (the server's broadcast and the host's persisted copy share one id) ----

export type LiveGift = {
  /** `gift-<senderId or name>-<sentAt>`: the app's id, so a broadcast and its history copy never double. */
  id: string;
  senderName: string;
  giftTitle: string;
  sentAt: string;
  giftImageUrl?: string;
  /** `live` arrived while watching (gets the float animation); `history` came from the room's metadata. */
  origin: 'live' | 'history';
};

export function giftId(gift: { senderId?: string; senderName: string; sentAt: string }): string {
  return `gift-${gift.senderId ?? gift.senderName}-${gift.sentAt}`;
}

export function giftFromMessage(m: LiveGiftMessage): LiveGift {
  return {
    id: giftId(m),
    senderName: m.senderName,
    giftTitle: m.giftTitle,
    sentAt: m.sentAt,
    ...(m.giftImageUrl ? { giftImageUrl: m.giftImageUrl } : {}),
    origin: 'live',
  };
}

// ---- Room metadata (written by the host's app) ----

export type LiveRoomHistory = { messages: LiveChatMessage[]; gifts: LiveGift[] };

/** Chat and gifts a late joiner missed. Anything malformed is simply left out. */
export function parseRoomHistory(metadata: string | null | undefined): LiveRoomHistory {
  const empty: LiveRoomHistory = { messages: [], gifts: [] };
  if (!metadata) return empty;
  let parsed: Raw;
  try {
    parsed = JSON.parse(metadata) as Raw;
  } catch {
    return empty;
  }
  const liveChat = parsed && typeof parsed.liveChat === 'object' ? (parsed.liveChat as Raw) : null;
  if (!liveChat) return empty;
  const messages = Array.isArray(liveChat.messages)
    ? (liveChat.messages as unknown[])
        .map(entry => (entry && typeof entry === 'object' ? chatMessage({ ...(entry as Raw), type: 'chat:message' }) : null))
        .filter((m): m is LiveChatMessage => m !== null)
    : [];
  const gifts = Array.isArray(liveChat.gifts)
    ? (liveChat.gifts as unknown[])
        .map(entry => {
          if (!entry || typeof entry !== 'object') return null;
          const g = entry as Raw;
          if (!str(g.id) || !str(g.name) || !str(g.giftTitle) || !str(g.sentAt)) return null;
          const gift: LiveGift = { id: g.id, senderName: g.name, giftTitle: g.giftTitle, sentAt: g.sentAt, origin: 'history' };
          if (str(g.giftImageUrl)) gift.giftImageUrl = g.giftImageUrl;
          return gift;
        })
        .filter((g): g is LiveGift => g !== null)
    : [];
  return { messages: dedupeMessages(messages), gifts };
}

/** Newest last, one per id, at most MAX_CHAT_MESSAGES. */
export function dedupeMessages(messages: LiveChatMessage[]): LiveChatMessage[] {
  const seen = new Set<string>();
  const out: LiveChatMessage[] = [];
  for (const m of messages) {
    if (seen.has(m.messageId)) continue;
    seen.add(m.messageId);
    out.push(m);
  }
  return out.slice(-MAX_CHAT_MESSAGES);
}

/** Merges gifts by id; a `live` copy wins over a `history` copy of the same gift (so the float isn't lost). */
export function mergeGifts(current: LiveGift[], incoming: LiveGift[]): LiveGift[] {
  const byId = new Map(current.map(g => [g.id, g]));
  for (const g of incoming) {
    const have = byId.get(g.id);
    if (!have || (have.origin === 'history' && g.origin === 'live')) byId.set(g.id, g);
  }
  return [...byId.values()]
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    .slice(-MAX_GIFTS);
}

/** First word of a display name, like the app's chat rows. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'Viewer';
}
