// The free chat (backend /free-consultation): one short chat-only consultation per client with the astrologers
// an admin picks; it opens again some months after the client used it.

export type FreeChatState = 'available' | 'booked' | 'waiting' | 'disabled';

/** GET /free-consultation/me. */
export type FreeChatStatus = {
  state: FreeChatState;
  /** Length of a free chat. */
  minutes: number;
  booking?: {
    bookingId: string;
    astrologerId: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
  };
  /** When the next free chat opens (state 'waiting'). */
  availableFrom?: string;
};

export const FREE_CHAT_STATUS_KEY = ['free-chat', 'status'] as const;

export const FREE_CHAT_STATUS_PATH = '/free-consultation/me';

/** Shown when a free chat's voice or video call button is pressed. */
export const FREE_CHAT_CALLS_MESSAGE =
  "Calls aren't part of the free chat. Voice and video calls come with paid consultations.";

/** The schedule screen in free chat mode. */
export function freeChatPath(astrologerId: string): string {
  return `/astrologer-profile/${encodeURIComponent(astrologerId)}/schedule?free=1`;
}

export function freeChatSlotsPath(astrologerId: string, date: string): string {
  return `/free-consultation/slots/${encodeURIComponent(astrologerId)}?date=${date}`;
}

export const FREE_CHAT_BOOK_PATH = '/free-consultation/book';

/** "Free · 5 min" on a booking. */
export function freeChatLabel(minutes: number | null | undefined): string {
  return minutes ? `Free · ${minutes} min` : 'Free';
}
