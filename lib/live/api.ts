// Backend routes for live streams, viewer side (astro-sewa-backend src/live-stream/controllers/live-stream.controller.ts).
// Payments have their own routes in lib/payments/checkout.ts (doc 06 + 10).

import { BackendError, type BackendClient } from '@/lib/backend/client';
import type { LiveCallType } from '@/lib/live/messages';

export type LiveRoomSummary = {
  roomId: string;
  roomName: string;
  astrologerId: string;
  astrologerName?: string;
  astrologerAvatar?: string;
  services?: string[];
  startedAt: string;
  viewerCount: number;
  callSlotPriceNpr?: number;
  callSlotPrices?: { npr: number; inr: number; usd: number };
};

export type LiveQueueEntryStatus = 'waiting' | 'called' | 'active' | 'completed' | 'left' | 'no_show';

export type LiveQueueStatus = {
  roomId: string;
  waitingCount: number;
  maxWaiting: number;
  isFull: boolean;
  isQueueOpen: boolean;
  canPay: boolean;
  userEntry?: {
    queueId: string;
    position: number;
    status: LiveQueueEntryStatus;
    callType: LiveCallType;
    turnExpiresAt?: string;
    secondsRemaining?: number;
  };
  activeCaller?: { userId: string; callType: LiveCallType; kickAt?: string; callerName?: string };
  callSlotPriceNpr?: number;
  /** What this viewer pays, for the countryCode sent (NP -> NPR, IN -> INR as NPR, else USD). */
  callSlotPrice?: { currency: string; amount: number };
};

export type LiveToken = { token: string; liveKitUrl: string; roomName: string; roomId?: string };

export type LiveCallerToken = {
  token: string;
  liveKitUrl: string;
  callType: LiveCallType;
  kickAt: string;
  queueId: string;
};

export type LiveApi = {
  activeRooms(): Promise<LiveRoomSummary[]>;
  queueStatus(roomId: string, countryCode?: string | null): Promise<LiveQueueStatus>;
  viewerToken(astrologerId: string, roomName: string): Promise<LiveToken>;
  /** My turn: the server marks the slot active and lets this connection publish. */
  acceptTurn(roomId: string): Promise<LiveCallerToken>;
  /** My slot is already active (page reloaded): a caller token, and publishing allowed again. */
  resumeCall(roomId: string): Promise<LiveCallerToken>;
  /** I end my call early. */
  completeCall(roomId: string): Promise<unknown>;
  /** Leave the queue while waiting or called. */
  leaveQueue(roomId: string): Promise<unknown>;
  likeStatus(roomId: string): Promise<{ likeCount: number; hasLiked: boolean }>;
  like(roomId: string): Promise<{ likeCount: number; hasLiked: boolean }>;
};

export function liveApi(backend: BackendClient): LiveApi {
  return {
    activeRooms: async () =>
      (await backend.get<{ rooms?: LiveRoomSummary[] }>('/live/rooms/active')).rooms ?? [],
    queueStatus: (roomId, countryCode) =>
      backend.get<LiveQueueStatus>(
        `/live/queue/status?roomId=${encodeURIComponent(roomId)}${countryCode ? `&countryCode=${encodeURIComponent(countryCode)}` : ''}`,
      ),
    viewerToken: (astrologerId, roomName) =>
      backend.post<LiveToken>('/live/token', { role: 'viewer', roomName, astrologerId }),
    acceptTurn: roomId => backend.post<LiveCallerToken>('/live/queue/accept', { roomId }),
    resumeCall: roomId => backend.post<LiveCallerToken>('/live/queue/resume', { roomId }),
    completeCall: roomId => backend.post('/live/queue/complete', { roomId }),
    leaveQueue: roomId => backend.post('/live/queue/leave', { roomId }),
    likeStatus: roomId =>
      backend.get<{ likeCount: number; hasLiked: boolean }>(`/live/rooms/${encodeURIComponent(roomId)}/reactions`),
    like: roomId =>
      backend.post<{ likeCount: number; hasLiked: boolean }>(`/live/rooms/${encodeURIComponent(roomId)}/reactions/like`, {}),
  };
}

export const REMOVED_MESSAGE = 'You have been removed from this stream';

/** What a refused live request means for the viewer. */
export type LiveRefusal = 'kicked' | 'not-live' | 'other';

export function classifyLiveError(error: unknown): LiveRefusal {
  if (error instanceof BackendError) {
    const text = error.message.toLowerCase();
    if (error.status === 403 && text.includes('removed from this stream')) return 'kicked';
    if (error.status === 404 || text.includes('not active') || text.includes('no longer available') || text.includes('has ended'))
      return 'not-live';
  }
  return 'other';
}

/** A refused request, in words for the person. */
export function liveErrorText(error: unknown, fallback: string): string {
  if (error instanceof BackendError) {
    if (error.status === 429) return 'Too many tries. Wait a minute and try again.';
    if (error.status >= 500) return 'The live service is not answering. Try again in a moment.';
    if (error.message) return error.message.replace(/\.?$/, '.');
  }
  return fallback;
}
