'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useBackendClient } from '@/hooks/use-backend-client';
import { outcomeOf, readStatus, statusPath } from '@/lib/payments/checkout';
import {
  type PendingPayment,
  awaitingLiveCall,
  markPayment,
  parsePending,
  pendingSnapshot,
  subscribePending,
} from '@/lib/payments/pending';

/** The app's standby retry is a few seconds; each check here also makes the server try to seat the buyer again. */
const STANDBY_CHECK_MS = 20_000;

/**
 * A live call this browser paid for in `roomId` while the queue was full (the app's standby): the server seats the
 * buyer as soon as a spot frees, and asking for the payment's status makes it try again now. Over once the queue
 * status shows this viewer (`inQueue`) or the payment settles another way. Returns the waiting payment, or null.
 */
export function useLiveCallStandby(
  roomId: string | null,
  inQueue: boolean,
  onSeated: () => void,
): PendingPayment | null {
  const backend = useBackendClient();
  const raw = useSyncExternalStore(subscribePending, pendingSnapshot, () => '');
  const waiting = useMemo(
    () => (roomId ? awaitingLiveCall(parsePending(raw || null), roomId) : null),
    [raw, roomId],
  );

  useQuery({
    queryKey: ['payments', 'live-standby', waiting?.gateway, waiting?.pidx],
    queryFn: async () => {
      const status = readStatus(await backend.bare.get(statusPath(waiting!.gateway, waiting!.pidx)));
      const outcome = outcomeOf(status);
      if (outcome === 'done') {
        markPayment(waiting!.pidx, { awaitingSlot: false });
        onSeated();
      } else if (outcome === 'deliveryFailed' || outcome === 'notPaid') {
        // Settled another way (the stream ended: the refund email is on its way).
        markPayment(waiting!.pidx, { awaitingSlot: false });
      }
      return status;
    },
    enabled: !!waiting && !inQueue,
    refetchInterval: STANDBY_CHECK_MS,
    retry: false,
  });

  // Seated (the queue status shows this viewer): the standby is over.
  useEffect(() => {
    if (waiting && inQueue) markPayment(waiting.pidx, { awaitingSlot: false });
  }, [waiting, inQueue]);

  return inQueue ? null : waiting;
}
