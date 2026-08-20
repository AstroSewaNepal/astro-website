'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchUnpaidEarningsSummary,
  fetchRecentPayouts,
  markAllEarningsPaid,
} from '@/lib/payouts-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useUnpaidEarnings(page: number, limit = 20, search?: string) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['unpaid-earnings', page, limit, search ?? ''],
    queryFn: () => fetchUnpaidEarningsSummary(token!, page, limit, search),
    enabled: !!token,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useRecentPayouts(page: number, limit = 10, search?: string) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['recent-payouts', page, limit, search ?? ''],
    queryFn: () => fetchRecentPayouts(token!, page, limit, search),
    enabled: !!token,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useMarkAllEarningsPaid() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      astrologerId,
      payoutReference,
    }: {
      astrologerId: string;
      payoutReference: string;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return markAllEarningsPaid(token, astrologerId, payoutReference);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unpaid-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['recent-payouts'] });
    },
  });
}
