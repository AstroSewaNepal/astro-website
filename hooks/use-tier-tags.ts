'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchTierTags,
  updateAstrologerTier,
  updateTierTagCommission,
  type UpdateTierTagCommissionInput,
} from '@/lib/tier-tags-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useTierTags() {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['tier-tags'],
    queryFn: () => fetchTierTags(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useUpdateTierTagCommission() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tagId,
      input,
    }: {
      tagId: string;
      input: UpdateTierTagCommissionInput;
    }) => updateTierTagCommission(token!, tagId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tier-tags'] }),
  });
}

export function useUpdateAstrologerTier() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      astrologerId,
      tierTagId,
    }: {
      astrologerId: string;
      tierTagId: string;
    }) => updateAstrologerTier(token!, astrologerId, tierTagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['astrologers'] });
      queryClient.invalidateQueries({ queryKey: ['tier-tags'] });
    },
  });
}
