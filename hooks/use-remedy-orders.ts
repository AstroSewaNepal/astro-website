'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { fetchAdminRemedyOrders, updateAdminRemedyOrderStatus } from '@/lib/remedy-order-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useUpdateRemedyOrderStatus() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      if (!token) throw new Error('Not authenticated');
      return updateAdminRemedyOrderStatus(token, id, status);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-remedy-orders'] }),
  });
}

export function useAdminRemedyOrders(page: number, limit = 20, status?: string) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['admin-remedy-orders', page, limit, status ?? ''],
    queryFn: () => fetchAdminRemedyOrders(token!, page, limit, status),
    enabled: !!token,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}
