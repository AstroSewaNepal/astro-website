// Consultation chat, as the app's ChatDetailsScreen + useChatDetails (ap src/screens/Chat, src/hooks).

import { astrologerShown, type Consultation } from '@/lib/booking/consultations';
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

/** Messages per history page (the app asks for 100). */
export const CHAT_PAGE_LIMIT = 100;

/** The chat of a booking: a sub-page of My Consultations, so the tab stays lit and back goes to the list. */
export function chatPath(bookingId: string): string {
  return `/client/consultations/${encodeURIComponent(bookingId)}`;
}

/** The chat socket lives at the API host's root, not under /api/v1. Null when the env is missing. */
export function chatSocketUrl(): string | null {
  const api = tryGetPublicBackendBaseUrl();
  if (!api) return null;
  try {
    return new URL(api).origin;
  } catch {
    return null;
  }
}

export function messagesPath(chatId: string, page: number): string {
  const q = new URLSearchParams({
    chatId,
    page: String(page),
    limit: String(CHAT_PAGE_LIMIT),
  });
  return `/chat-messages?${q}`;
}

/** GET /connection-schedule/:id (the parts the chat uses). One chat per client and astrologer, shared by bookings. */
export type ChatBooking = Pick<
  Consultation,
  | '_id'
  | 'astrologerId'
  | 'astrologer'
  | 'scheduledStartAt'
  | 'scheduledEndAt'
  | 'status'
  | 'chatId'
  | 'reviewId'
> & {
  /** The astrologer has the chat socket open (the app's Online/Offline). */
  astrologerIsSocketConnected?: boolean;
};

/** Call messages (backend ChatCallSignalService): one per call, updated as it goes started -> ongoing -> ended. */
export type ChatCallStatus = 'started' | 'ongoing' | 'ended';

export type ChatCallInfo = {
  callType: 'audio' | 'video';
  status: ChatCallStatus;
  /** The booking whose call it is (one chat is shared by all bookings with the same astrologer). */
  bookingId: string;
  /** Set once the other person joined; an ended call without it was missed. */
  answered: boolean;
  /** Talk time; missing when the end wasn't seen (the bubble then just says it ended). */
  durationSec?: number;
};

/** A message from GET /chat-messages or the socket's `message` / `message_edited` events. */
export type BackendChatMessage = {
  _id: string;
  message?: string | null;
  kind?: string | null;
  call?: {
    callType?: string;
    status?: string;
    connectionSchedule?: string | null;
    answeredAt?: string | null;
    durationSec?: number | null;
  } | null;
  createdAt: string;
  sender?: { _id?: string; fullName?: string | null } | string | null;
  /** Populated in the history and broadcasts; only the id in the sender's own socket ack. */
  media?:
    | {
        _id?: string;
        url?: string | null;
        compressed?: { url?: string | null } | null;
        thumbnail?: { url?: string | null } | null;
      }
    | string
    | null;
};

/** POST /chat-messages/upload-image (inside the usual envelope). */
export type UploadedChatImage = {
  _id: string;
  url?: string | null;
  compressed?: { url?: string | null } | null;
};

/** GET /chat-messages answers without the usual envelope: newest first. */
export type ChatMessagesPage = {
  messages: BackendChatMessage[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type ChatItem = {
  id: string;
  text: string;
  /** Shown in the bubble: the WebP copy when there is one. */
  image: string | null;
  /** Opened in the viewer: the original. */
  fullImage?: string | null;
  mediaId?: string;
  at: Date;
  mine: boolean;
  /** Only on own messages the server hasn't confirmed yet (lib/chat/live.ts). */
  status?: 'sending' | 'failed';
  /** Why a failed message wasn't sent. */
  error?: string;
  /** A call message: shown as a call bubble, not its plain text. */
  call?: ChatCallInfo;
};

function senderId(m: BackendChatMessage): string {
  if (!m.sender) return '';
  return typeof m.sender === 'string' ? m.sender : (m.sender._id ?? '');
}

/**
 * Only https images reach an <img> or the viewer's link. Message data comes from the other person's side of the
 * chat, so a `javascript:`/`data:` URL or a typo never gets a link or a request.
 */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === 'https:') return u.href;
  } catch {
    // Not a URL.
  }
  return null;
}

/** Bubble and viewer URLs of an uploaded or populated image. */
export function chatImageUrls(media: {
  url?: string | null;
  compressed?: { url?: string | null } | null;
}): { image: string | null; fullImage: string | null } {
  const full = safeImageUrl(media.url);
  return { image: safeImageUrl(media.compressed?.url) ?? full, fullImage: full };
}

const CALL_STATUSES: readonly ChatCallStatus[] = ['started', 'ongoing', 'ended'];

/** The call part of a call message; null for other messages (or a call message this page can't read). */
export function chatCallInfo(m: BackendChatMessage): ChatCallInfo | null {
  const c = m.call;
  if (m.kind !== 'call' || !c) return null;
  const status = CALL_STATUSES.find(s => s === c.status);
  if (!status) return null;
  return {
    callType: c.callType === 'audio' ? 'audio' : 'video',
    status,
    bookingId: c.connectionSchedule ? String(c.connectionSchedule) : '',
    answered: !!c.answeredAt,
    ...(typeof c.durationSec === 'number' ? { durationSec: c.durationSec } : {}),
  };
}

export function toChatItem(m: BackendChatMessage, myId: string | undefined): ChatItem {
  const media = m.media && typeof m.media === 'object' ? m.media : null;
  const mediaId = typeof m.media === 'string' ? m.media : media?._id;
  const call = chatCallInfo(m);
  return {
    id: m._id,
    text: m.message ?? '',
    ...(media ? chatImageUrls(media) : { image: null, fullImage: null }),
    ...(mediaId ? { mediaId: String(mediaId) } : {}),
    at: new Date(m.createdAt),
    mine: !!myId && senderId(m) === myId,
    ...(call ? { call } : {}),
  };
}

/**
 * Of two copies of the same message, the one to show. Call messages only move forward (started -> ongoing ->
 * ended), so the furthest wins even when an older copy arrives later (a history page fetched before the update).
 * Otherwise the later copy wins (an edit).
 */
export function newerCopy(a: ChatItem, b: ChatItem): ChatItem {
  if (a.call && b.call) {
    return CALL_STATUSES.indexOf(b.call.status) >= CALL_STATUSES.indexOf(a.call.status) ? b : a;
  }
  return b;
}

/** Copies that show the same thing (an update that changes nothing keeps the list as it is). */
export function sameContent(a: ChatItem, b: ChatItem): boolean {
  return (
    a.text === b.text &&
    a.image === b.image &&
    a.call?.status === b.call?.status &&
    a.call?.answered === b.call?.answered &&
    a.call?.durationSec === b.call?.durationSec
  );
}

/** What a call bubble says: "Video call" + "Waiting for you to join", "Missed voice call", "Video call" + "4 min". */
export function callBubbleText(
  call: ChatCallInfo,
  mine: boolean,
  partnerName: string,
): { title: string; detail: string | null; missed: boolean } {
  const kind = call.callType === 'audio' ? 'voice' : 'video';
  const title = `${kind === 'voice' ? 'Voice' : 'Video'} call`;
  if (call.status === 'started') {
    return {
      title,
      detail: mine ? `Waiting for ${partnerName} to join` : 'Waiting for you to join',
      missed: false,
    };
  }
  if (call.status === 'ongoing') return { title, detail: 'Call in progress', missed: false };
  if (!call.answered) {
    // Missed: the caller sees nobody answered, the other person that they missed it.
    return mine
      ? { title, detail: 'No answer', missed: false }
      : { title: `Missed ${kind} call`, detail: null, missed: true };
  }
  if (call.durationSec === undefined) return { title, detail: 'Ended', missed: false };
  const detail =
    call.durationSec < 60 ? `${call.durationSec} sec` : `${Math.round(call.durationSec / 60)} min`;
  return { title, detail, missed: false };
}

/**
 * Pages (newest first, as fetched) to one oldest-first list without repeats: a message that moves to the next page
 * while older pages load must not show twice (the app keys rows by id for the same reason).
 */
export function historyItems(pages: ChatMessagesPage[], myId: string | undefined): ChatItem[] {
  const byId = new Map<string, ChatItem>();
  for (const page of pages) {
    for (const m of page.messages ?? []) {
      const item = toChatItem(m, myId);
      const known = byId.get(m._id);
      // A call message on two pages: the page fetched later may have the newer status.
      byId.set(m._id, known ? newerCopy(known, item) : item);
    }
  }
  return [...byId.values()].sort((a, b) => a.at.getTime() - b.at.getTime());
}

export function hasOlderPage(page: ChatMessagesPage | undefined): boolean {
  return !!page && page.pagination.page < page.pagination.pages;
}

/** Who the client is talking to: hidden once the astrologer's account is being deleted (the app). */
export function chatPartner(b: ChatBooking | undefined): { name: string; photo: string | null } {
  if (!b) return { name: 'Astrologer', photo: null };
  const { name, photo } = astrologerShown(b as Consultation);
  return { name, photo };
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "20 Mar 2025" chip above the first message of each day (Figma). */
export function dayChip(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Indexes of the items that start a new day. */
export function dayStarts(items: ChatItem[]): Set<number> {
  const starts = new Set<number>();
  items.forEach((item, i) => {
    if (i === 0 || !sameDay(items[i - 1].at, item.at)) starts.add(i);
  });
  return starts;
}

/** "2:46 pm" under a bubble. */
export function messageTime(d: Date): string {
  return d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase();
}
