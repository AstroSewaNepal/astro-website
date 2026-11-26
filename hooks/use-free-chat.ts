'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { Astrologer } from '@/components/pages/landing/talk-to-our-astrologer/types';
import { useBackendClient } from '@/hooks/use-backend-client';
import { accountKind } from '@/lib/auth/account';
import { BackendError } from '@/lib/backend/client';
import {
  FREE_CHAT_STATUS_KEY,
  FREE_CHAT_STATUS_PATH,
  freeChatPath,
  type FreeChatStatus,
} from '@/lib/booking/free-chat';

/** The signed-in client's free chat. Guests, astrologers and admins have none. */
export function useFreeChatStatus(enabled = true) {
  const backend = useBackendClient();
  const { data: session } = useSession();
  const isClient = accountKind(session?.user?.roles) === 'client';
  return useQuery({
    queryKey: FREE_CHAT_STATUS_KEY,
    queryFn: () => backend.get<FreeChatStatus>(FREE_CHAT_STATUS_PATH),
    enabled: enabled && isClient,
    staleTime: 60 * 1000,
    retry: (count, error) => !(error instanceof BackendError && error.status < 500) && count < 2,
  });
}

/**
 * Where an astrologer's Connect Now goes instead while the client's free chat is open and the astrologer gives
 * free chats; undefined keeps Connect Now. A booked or used free chat turns it back into Connect Now.
 */
export function useFreeChatLink(): (
  astrologer: Pick<Astrologer, 'freeConsultationEligible' | 'user'>,
) => string | undefined {
  const status = useFreeChatStatus();
  const open = status.data?.state === 'available';
  return astrologer =>
    open && astrologer.freeConsultationEligible && astrologer.user?._id
      ? freeChatPath(astrologer.user._id)
      : undefined;
}
