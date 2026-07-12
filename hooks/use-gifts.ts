"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createGift,
  deleteGift,
  deleteMedia,
  fetchGifts,
  updateGift,
  uploadMedia,
  type CreateGiftInput,
  type UpdateGiftInput,
} from "@/lib/gifts-api";

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  return session?.backendAccessToken ?? null;
}

export function useGifts() {
  const token = useBackendToken();
  return useQuery({
    queryKey: ["gifts"],
    queryFn: () => fetchGifts(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useCreateGift() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGiftInput) => createGift(token!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gifts"] }),
  });
}

export function useUpdateGift() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGiftInput }) =>
      updateGift(token!, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gifts"] }),
  });
}

export function useDeleteGift() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGift(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gifts"] }),
  });
}

export function useUploadMedia() {
  const token = useBackendToken();
  return useMutation({
    mutationFn: (file: File) => {
      if (!token) throw new Error("Not authenticated");
      return uploadMedia(token, file);
    },
  });
}

export function useDeleteMedia() {
  const token = useBackendToken();
  return useMutation({
    mutationFn: (mediaId: string) => {
      if (!token) throw new Error("Not authenticated");
      return deleteMedia(token, mediaId);
    },
  });
}
