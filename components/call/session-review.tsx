'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ReviewDialog } from '@/components/booking/review-dialog';
import type { CallRequest } from '@/components/call/call-provider';
import { useBackendClient } from '@/hooks/use-backend-client';
import type { ChatBooking } from '@/lib/chat/messages';
import { QueryProvider } from '@/providers/query-provider';

/**
 * The call layer sits in the root layout, above the page areas' query clients (account area, Astro Connect), so the
 * review brings its own. A My Consultations card that still offers Leave a Review afterwards flips to its real state
 * when tapped (the backend refuses a second review).
 */
export default function SessionReview(props: { request: CallRequest; onClose: () => void }) {
  return (
    <QueryProvider>
      <SessionReviewInner {...props} />
    </QueryProvider>
  );
}

/**
 * The session's time ran out during a call while the client was on another page: what the chat page does at that
 * moment (the app's openPostEndUI), done from the call layer. The booking is ended on the backend (idempotent, and a
 * review is only taken once it is COMPLETED), then the review opens unless one was already left.
 */
function SessionReviewInner({ request, onClose }: { request: CallRequest; onClose: () => void }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const { bookingId } = request;

  const end = useMutation({
    mutationFn: () => backend.patch(`/connection-schedule/${encodeURIComponent(bookingId)}/end`),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'booking', bookingId] });
      void queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
  const { mutate: endNow } = end;
  // Once (React's development double run would send it twice).
  const endSent = useRef(false);
  useEffect(() => {
    if (endSent.current) return;
    endSent.current = true;
    endNow();
  }, [endNow]);

  // Same cache entry as the chat page.
  const booking = useQuery({
    queryKey: ['chat', 'booking', bookingId],
    queryFn: () =>
      backend.get<ChatBooking>(`/connection-schedule/${encodeURIComponent(bookingId)}`),
  });

  // Already reviewed (another tab or device), or the booking can't be read: nothing to ask.
  const nothingToAsk = booking.isError || !!booking.data?.reviewId;
  useEffect(() => {
    if (nothingToAsk) onClose();
  }, [nothingToAsk, onClose]);

  if (!request.astrologerId || !booking.data || nothingToAsk) return null;
  return (
    <ReviewDialog
      astrologerId={request.astrologerId}
      bookingId={bookingId}
      astrologerName={request.partner.name}
      photo={request.partner.photo}
      waiting={end.isPending}
      onClose={onClose}
      onDone={onClose}
    />
  );
}
