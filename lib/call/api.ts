// Backend routes for consultation calls (astro-sewa-backend src/video-call/controllers/video-call.controllers.ts).

import { BackendError, type BackendClient } from '@/lib/backend/client';
import type { CallApi, CallType } from '@/lib/call/session';

export function callApi(backend: BackendClient): CallApi {
  return {
    mintToken: (bookingId: string, callType: CallType) =>
      backend.post<{ token: string; roomName: string; liveKitUrl: string }>(
        '/video-call/consultation/token',
        { connectionScheduleId: bookingId, callType },
      ),
    reportLeft: (bookingId: string, options?: { keepalive?: boolean }) =>
      backend.post('/video-call/consultation/left', { connectionScheduleId: bookingId }, options),
  };
}

/** A refused token request, in words for the person. */
export function callStartError(error: unknown): string {
  if (error instanceof BackendError) {
    // 403 carries the reason: "This consultation has not started yet" / "has ended" / "is not active".
    if (error.status === 403 && error.message) return `${error.message}.`;
    if (error.status === 404) return 'This consultation could not be found.';
    if (error.status === 429) return 'Too many tries. Wait a minute and try again.';
    if (error.status >= 500) return 'The call service is not answering. Try again in a moment.';
  }
  return 'Could not start the call. Check your internet connection and try again.';
}
