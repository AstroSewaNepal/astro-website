"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createRemediesCategory,
  deleteMedia,
  deleteRemediesCategory,
  fetchRemediesCategories,
  updateRemediesCategory,
  uploadMedia,
  type CreateRemediesCategoryInput,
  type UpdateRemediesCategoryInput,
} from "@/lib/remedies-category-api";

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  return session?.backendAccessToken ?? null;
}

export function useRemediesCategories() {
  const token = useBackendToken();
  return useQuery({
    queryKey: ["remedies-categories"],
    queryFn: () => fetchRemediesCategories(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useCreateRemediesCategory() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRemediesCategoryInput) =>
      createRemediesCategory(token!, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["remedies-categories"] }),
  });
}

export function useUpdateRemediesCategory() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRemediesCategoryInput }) =>
      updateRemediesCategory(token!, id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["remedies-categories"] }),
  });
}

export function useDeleteRemediesCategory() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRemediesCategory(token!, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["remedies-categories"] }),
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
