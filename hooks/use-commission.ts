'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchAllCommissions,
  updateCommissionBySource,
  type CommissionSource,
  type UpdateCommissionInput,
} from '@/lib/commission-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commissions'] }),
  });
}
