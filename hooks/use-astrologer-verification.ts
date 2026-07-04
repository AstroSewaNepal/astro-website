'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchOnboardingStatusDetail,
  fetchPendingOnboardingAstrologers,
  updateFinalDecision,
  type UpdateFinalDecisionInput,
} from '@/lib/astrologer-verification-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function usePendingOnboardingAstrologers(page: number, limit = 20, search?: string) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['pending-onboarding', page, limit, search ?? ''],
    queryFn: () => fetchPendingOnboardingAstrologers(token!, page, limit, search),
    enabled: !!token,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useOnboardingStatusDetail(astrologerId: string | null) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['onboarding-detail', astrologerId],
    queryFn: () => fetchOnboardingStatusDetail(token!, astrologerId!),
    enabled: !!token && !!astrologerId,
  });
}

export function useUpdateFinalDecision() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      astrologerId,
      input,
    }: {
      astrologerId: string;
      input: UpdateFinalDecisionInput;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return updateFinalDecision(token, astrologerId, input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-detail', variables.astrologerId] });
    },
  });
}
