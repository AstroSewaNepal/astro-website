"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { createApiClient } from "@/lib/api-client";

export type AdminStats = {
  posts: number;
  tags: number;
  authors: number;
};

export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  reading_time: number | null;
  status: string;
  primary_tag?: { name: string } | null;
  primary_author?: { name: string } | null;
};

// Returns a bound API client once the session token is available, null while loading
function useApiClient() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (!session?.accessToken) return null;
  return createApiClient(session.accessToken);
}

export function useAdminStats() {
  const client = useApiClient();

  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await client!.get<AdminStats>("/api/admin/stats");
      if (res.error) throw new Error(res.error);
      return res.data!;
    },
    enabled: !!client, // holds until token is ready — prevents 401 flash on mount
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminPosts() {
  const client = useApiClient();

  return useQuery<AdminPost[]>({
    queryKey: ["admin", "posts"],
    queryFn: async () => {
      const res = await client!.get<{ posts: AdminPost[] }>("/api/admin/posts");
      if (res.error) throw new Error(res.error);
      return res.data!.posts;
    },
    enabled: !!client,
    staleTime: 60 * 1000,
  });
}
