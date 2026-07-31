'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { fetchAdminAstrologers } from '@/lib/astrologers-admin-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useAdminAstrologers(page: number, limit = 20, search?: string) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['astrologers', page, limit, search ?? ''],
    queryFn: () => fetchAdminAstrologers(token!, page, limit, search),
    enabled: !!token,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}
