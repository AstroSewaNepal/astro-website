'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  assignAstrologerTier,
  createTier,
  deleteTier,
  fetchTiers,
  updateTier,
  type CreateTierInput,
  type UpdateTierInput,
} from '@/lib/tier-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useTiers() {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['tiers'],
    queryFn: () => fetchTiers(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useCreateTier() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTierInput) => createTier(token!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiers'] }),
  });
}

export function useUpdateTier() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tierId, input }: { tierId: string; input: UpdateTierInput }) =>
      updateTier(token!, tierId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiers'] }),
  });
}

export function useDeleteTier() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tierId: string) => deleteTier(token!, tierId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiers'] }),
  });
}

export function useAssignTier() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ astrologerId, tierId }: { astrologerId: string; tierId: string | null }) =>
      assignAstrologerTier(token!, astrologerId, tierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['astrologers'] });
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
    },
  });
}
