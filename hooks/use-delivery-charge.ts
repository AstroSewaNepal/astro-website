'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  createDeliveryCharge,
  deleteDeliveryCharge,
  fetchDeliveryCharges,
  updateDeliveryCharge,
  type CreateDeliveryChargeInput,
  type UpdateDeliveryChargeInput,
} from '@/lib/delivery-charge-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useDeliveryCharges() {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['delivery-charges'],
    queryFn: () => fetchDeliveryCharges(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useCreateDeliveryCharge() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeliveryChargeInput) => createDeliveryCharge(token!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-charges'] }),
  });
}

export function useUpdateDeliveryCharge() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDeliveryChargeInput }) =>
      updateDeliveryCharge(token!, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-charges'] }),
  });
}

export function useDeleteDeliveryCharge() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeliveryCharge(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-charges'] }),
  });
}
