'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchContentReports,
  updateContentReportStatus,
  updateUserSuspension,
  type ReportStatus,
} from '@/lib/content-reports-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useContentReports(page: number, limit = 20, status?: ReportStatus) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['admin-content-reports', page, limit, status ?? ''],
    queryFn: () => fetchContentReports(token!, page, limit, status),
    enabled: !!token,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateContentReportStatus() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      status,
      resolutionNote,
      suspendReportedUser,
    }: {
      reportId: string;
      status: Exclude<ReportStatus, 'PENDING'>;
      resolutionNote?: string;
      suspendReportedUser?: boolean;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return updateContentReportStatus(
        token,
        reportId,
        status,
        resolutionNote,
        suspendReportedUser,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-reports'] });
    },
  });
}

export function useUpdateUserSuspension() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      suspended,
      reason,
    }: {
      userId: string;
      suspended: boolean;
      reason?: string;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return updateUserSuspension(token, userId, suspended, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-reports'] });
    },
  });
}
