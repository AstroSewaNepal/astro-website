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

/** A message from GET /chat-messages or the socket's `message` event. */
export type BackendChatMessage = {
  _id: string;
  message?: string | null;
  createdAt: string;
  sender?: { _id?: string; fullName?: string | null } | string | null;
  media?: {
    url?: string | null;
    compressed?: { url?: string | null } | null;
    thumbnail?: { url?: string | null } | null;
  } | null;
};

/** GET /chat-messages answers without the usual envelope: newest first. */
export type ChatMessagesPage = {
  messages: BackendChatMessage[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type ChatItem = {
  id: string;
  text: string;
  image: string | null;
  at: Date;
  mine: boolean;
  /** Only on own messages the server hasn't confirmed yet (lib/chat/live.ts). */
  status?: 'sending' | 'failed';
  /** Why a failed message wasn't sent. */
  error?: string;
};

function senderId(m: BackendChatMessage): string {
  if (!m.sender) return '';
  return typeof m.sender === 'string' ? m.sender : (m.sender._id ?? '');
}

export function toChatItem(m: BackendChatMessage, myId: string | undefined): ChatItem {
  return {
    id: m._id,
    text: m.message ?? '',
    image: m.media?.url || m.media?.compressed?.url || null,
    at: new Date(m.createdAt),
    mine: !!myId && senderId(m) === myId,
  };
}

/**
 * Pages (newest first, as fetched) to one oldest-first list without repeats: a message that moves to the next page
 * while older pages load must not show twice (the app keys rows by id for the same reason).
 */
export function historyItems(pages: ChatMessagesPage[], myId: string | undefined): ChatItem[] {
  const seen = new Set<string>();
  const items: ChatItem[] = [];
  for (const page of pages) {
    for (const m of page.messages ?? []) {
      if (seen.has(m._id)) continue;
      seen.add(m._id);
      items.push(toChatItem(m, myId));
    }
  }
  return items.sort((a, b) => a.at.getTime() - b.at.getTime());
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
