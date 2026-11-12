'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Loader2, UserRound } from 'lucide-react';

import { useBackendClient } from '@/hooks/use-backend-client';
import { safeImageUrl } from '@/lib/chat/messages';
import { BLOCKED_LIST_KEY, BLOCKS_KEY, type BlockedUser } from '@/lib/moderation';

/** The app loads one page of this size (BlockedUsersScreen). */
const LIMIT = 100;

/** Settings > Security > Blocked users (the app's BlockedUsersScreen): everyone this user blocked, with Unblock. */
export function BlockedUsers() {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const [done, setDone] = useState<string | null>(null);

  const list = useQuery({
    queryKey: BLOCKED_LIST_KEY,
    queryFn: () => backend.get<BlockedUser[]>(`/blocks?page=1&limit=${LIMIT}`),
  });
  const unblock = useMutation({
    mutationFn: (u: BlockedUser) => backend.delete(`/blocks/${encodeURIComponent(u.userId)}`),
    onSuccess: (_, u) => {
      setDone(`${u.fullName?.trim() || 'This user'} has been unblocked.`);
      void queryClient.invalidateQueries({ queryKey: BLOCKS_KEY });
    },
  });
  const users = Array.isArray(list.data) ? list.data : [];

  return (
    <div className="mx-auto w-full max-w-[640px] font-app">
      <h1 className="mb-6 text-center text-[28px] font-normal text-primary lg:text-[34px]">
        Blocked users
      </h1>
      {done ? (
        <p
          role="status"
          className="mb-4 rounded-xl bg-[#e7f6ec] px-4 py-2.5 text-[15px] text-[#1f4d23]"
        >
          {done}
        </p>
      ) : null}
      {unblock.isError ? (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-[#fdecea] px-4 py-2.5 text-[15px] text-[#4a1a1a]"
        >
          <b>Could not unblock this user.</b> {unblock.error.message}
        </p>
      ) : null}
      {list.isPending ? (
        <div className="flex justify-center py-16" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : list.isError ? (
        <div className="py-16 text-center text-[17px] text-[#4a1a1a]">
          <p>Could not load blocked users.</p>
          <button
            type="button"
            onClick={() => list.refetch()}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      ) : !users.length ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Ban className="h-14 w-14 text-primary" strokeWidth={1.25} aria-hidden />
          <p className="text-[20px] text-primary">You haven&apos;t blocked anyone</p>
          <p className="text-[15px] text-[#6d6d6d]">People you block will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#e8ddd0] rounded-2xl border border-[#e8ddd0] bg-[#f8f0dc]">
          {users.map(u => {
            const name = u.fullName?.trim() || 'Anonymous';
            const photo = safeImageUrl(u.profilePicture);
            const busy = unblock.isPending && unblock.variables?.userId === u.userId;
            return (
              <li key={u.userId} className="flex items-center gap-3 px-4 py-3">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
                  <img
                    src={photo}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8ddd0] text-primary">
                    <UserRound className="h-5 w-5" aria-hidden />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-[17px] font-medium text-primary">
                  {name}
                </span>
                <button
                  type="button"
                  disabled={unblock.isPending}
                  onClick={() => {
                    setDone(null);
                    unblock.mutate(u);
                  }}
                  aria-label={`Unblock ${name}`}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-primary px-4 text-[15px] text-primary disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  Unblock
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
