'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchAllCommissions,
  fetchCommission,
  updateCommission,
  updateCommissionBySource,
  type CommissionSource,
  type UpdateCommissionInput,
} from '@/lib/commission-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useCommission() {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['commission'],
    queryFn: () => fetchCommission(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useUpdateCommission() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCommissionInput) => updateCommission(token!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commission'] }),
  });
}

export function useAllCommissions() {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['commissions'],
    queryFn: () => fetchAllCommissions(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useUpdateCommissionBySource(source: CommissionSource) {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCommissionInput) => updateCommissionBySource(token!, source, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      // The consultation source shares its config with the legacy single-rate endpoint
      queryClient.invalidateQueries({ queryKey: ['commission'] });
    },
  });
}
