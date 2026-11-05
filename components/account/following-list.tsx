'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, GraduationCap, Languages, Loader2, Search, UsersRound } from 'lucide-react';

import { Stars } from '@/components/astrologers/profile/stars';
import { useBackendClient } from '@/hooks/use-backend-client';
import { nextPage, PAGE_LIMIT, profilePath } from '@/lib/astrologers/list';

/** GET /follow/following items. */
type Followed = {
  followeeId: string;
  followeeName?: string | null;
  profilePicture?: string | null;
  languages?: string[] | null;
  specialist?: string[] | null;
  services?: string[] | null;
  yearsOfExperience?: number | null;
  rating?: number | null;
};

const FOLLOWING_KEY = ['follow', 'following'] as const;

/** My Following (Figma Home/My-following, the app's FollowedAstrologersScreen). */
export function FollowingList() {
  const backend = useBackendClient();
  const [search, setSearch] = useState('');

  const list = useInfiniteQuery({
    queryKey: FOLLOWING_KEY,
    queryFn: async ({ pageParam }) => {
      const res = await backend.request<Followed[]>(
        'GET',
        `/follow/following?page=${pageParam}&limit=${PAGE_LIMIT}&followeeType=ASTROLOGER`,
      );
      return { items: Array.isArray(res.data) ? res.data : [], pagination: res.pagination };
    },
    initialPageParam: 1,
    getNextPageParam: last => nextPage(last.pagination, last.items.length),
  });

  const all = useMemo(() => (list.data?.pages ?? []).flatMap(p => p.items), [list.data]);
  // Like the app, the search filters the loaded list by name.
  const shown = search.trim()
    ? all.filter(a => (a.followeeName ?? '').toLowerCase().includes(search.trim().toLowerCase()))
    : all;

  const end = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  useEffect(() => {
    const node = end.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '300px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full">
      <h1 className="mb-5 text-center text-[28px] font-normal text-primary lg:text-left lg:text-[34px]">
        My Following
      </h1>

      {list.isPending ? (
        <div className="flex justify-center py-20" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : list.isError ? (
        <div className="py-16 text-center font-mukta text-[17px] text-[#4a1a1a]">
          <p>We could not load the astrologers you follow.</p>
          <button
            type="button"
            onClick={() => list.refetch()}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      ) : !all.length ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <UsersRound className="h-16 w-16 text-primary" strokeWidth={1.25} aria-hidden />
          <p className="font-mukta text-[20px] text-primary">
            Looks like you haven&apos;t followed anyone yet.
          </p>
          <Link
            href="/astrologers"
            className="rounded-full bg-primary px-6 py-2.5 font-mukta text-[16px] text-white"
          >
            Find astrologers
          </Link>
        </div>
      ) : (
        <>
          <label className="relative mb-5 block">
            <span className="sr-only">Search by name</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4a1a1a]"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name"
              className="h-[48px] w-full rounded-full border border-[#720A0B] bg-transparent pl-12 pr-5 font-mukta text-[16px] text-[#4a1a1a] outline-none"
            />
          </label>
          {shown.length ? (
            <ul className="grid gap-3 xl:grid-cols-2">
              {shown.map(a => (
                <FollowedCard key={a.followeeId} astrologer={a} />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center font-mukta text-[16px] text-[#6d6d6d]">
              No one you follow matches &ldquo;{search.trim()}&rdquo;.
            </p>
          )}
          <div ref={end} aria-hidden />
          {isFetchingNextPage ? (
            <div className="flex justify-center py-6" role="status" aria-label="Loading more">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : hasNextPage ? (
            <div className="flex justify-center py-6">
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                className="rounded-full bg-primary px-6 py-2.5 font-mukta text-[16px] text-white"
              >
                Show more
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function FollowedCard({ astrologer: a }: { astrologer: Followed }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const name = a.followeeName?.trim() || 'Astrologer';
  const href = profilePath(a.followeeId);
  const unfollow = useMutation({
    mutationFn: () =>
      backend.delete('/follow', { followeeId: a.followeeId, followeeType: 'ASTROLOGER' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FOLLOWING_KEY });
      void queryClient.invalidateQueries({ queryKey: ['follow', 'status', a.followeeId] });
    },
  });
  // The app shows `specialist`; most accounts only fill `services`, so fall back to those.
  const skills = a.specialist?.length ? a.specialist : (a.services ?? []);
  const rows = [
    { key: 'languages', icon: Languages, text: a.languages?.join(', ') },
    { key: 'skills', icon: Award, text: skills.join(', ') },
    {
      key: 'experience',
      icon: GraduationCap,
      text: a.yearsOfExperience != null ? `${a.yearsOfExperience} years` : '',
    },
  ].filter(r => r.text);

  return (
    <li className="relative flex gap-4 rounded-[16px] border border-[#c9837a] bg-[#fbf6ee] p-4">
      <Link href={href} className="shrink-0" aria-label={`View ${name}'s profile`}>
        <span className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-[#f1d9d2] font-mukta text-2xl font-semibold text-primary">
          {a.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
            <img src={a.profilePicture} alt="" className="h-full w-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="line-clamp-1 pr-20 font-mukta text-[17px] font-semibold text-primary hover:underline"
        >
          {name}
        </Link>
        <ul className="mt-1 space-y-0.5">
          {rows.map(r => (
            <li
              key={r.key}
              className="flex items-center gap-2 font-mukta text-[14px] text-[#4a4a4a]"
            >
              <r.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="line-clamp-1">{r.text}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => unfollow.mutate()}
          disabled={unfollow.isPending}
          className="mt-2.5 flex h-[34px] items-center gap-2 rounded-full border border-[#BE7B71] px-4 font-mukta text-[14px] text-primary disabled:opacity-60"
        >
          {unfollow.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          Unfollow
        </button>
        {unfollow.isError ? (
          <p role="alert" className="mt-1 font-mukta text-sm text-red-700">
            Could not unfollow. Please try again.
          </p>
        ) : null}
      </div>
      {a.rating ? <Stars rating={a.rating} size={14} className="absolute right-4 top-4" /> : null}
    </li>
  );
}
