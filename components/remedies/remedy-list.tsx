'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Gem, Loader2 } from 'lucide-react';
import clsx from 'clsx';

import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import {
  matchesRemedy,
  nextRemediesPage,
  remediesListPath,
  type Remedy,
  type RemedyCategory,
} from '@/lib/remedies/catalogue';

import { GoToCartBar, RemediesHeader } from './remedy-bits';
import { RemedyCard, RemedyCardSkeleton } from './remedy-card';
import { SearchBox } from './search-box';

type Tag = { _id?: string; name?: string };

/**
 * The app's RemedyListScreen: one category's products, 10 per page, with search and expertise chips. Like the
 * app, search and chips filter the pages already loaded (the backend list has no search).
 */
export function RemedyList({ categoryId }: { categoryId: string }) {
  const backend = useBackendClient();
  const { countryCode, isResolved } = useBuyerCountry();
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search);
  const [tag, setTag] = useState<string | null>(null);

  // The title comes from the (cached) category list, so a shared link shows it too.
  const categories = useQuery({
    queryKey: ['remedies', 'categories'],
    queryFn: () => backend.get<RemedyCategory[]>('/remedies-categories'),
    staleTime: 10 * 60 * 1000,
  });
  const category = Array.isArray(categories.data)
    ? categories.data.find(c => c._id === categoryId)
    : undefined;

  const tags = useQuery({
    queryKey: ['astrologer-tags', 'expertise'],
    queryFn: () => backend.get<Tag[]>('/astrologer-tags?type=expertise'),
    staleTime: 60 * 60 * 1000,
  });

  const list = useInfiniteQuery({
    queryKey: ['remedies', 'list', categoryId, countryCode],
    queryFn: async ({ pageParam }) => {
      const res = await backend.request<Remedy[]>(
        'GET',
        remediesListPath(pageParam, categoryId, countryCode),
      );
      return { remedies: Array.isArray(res.data) ? res.data : [], pagination: res.pagination };
    },
    initialPageParam: 1,
    getNextPageParam: last => nextRemediesPage(last.pagination, last.remedies.length),
    placeholderData: keepPreviousData,
    // Wait for the country so prices don't show in NPR first and then switch.
    enabled: isResolved,
  });

  const all = useMemo(() => {
    const seen = new Set<string>();
    return (list.data?.pages ?? [])
      .flatMap(p => p.remedies)
      .filter(r => (seen.has(r.id) ? false : (seen.add(r.id), true)));
  }, [list.data]);
  const remedies = all.filter(r => matchesRemedy(r, query, tag));

  const end = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  useEffect(() => {
    const node = end.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const chips = [
    { id: null as string | null, label: 'All' },
    ...(Array.isArray(tags.data) ? tags.data : [])
      .filter((t): t is Required<Tag> => Boolean(t._id && t.name))
      .map(t => ({ id: t.name as string | null, label: t.name })),
  ];
  const loadingFirstPage = !isResolved || (list.isPending && !list.data);

  return (
    <div className="flex w-full flex-col">
      <RemediesHeader title={category?.title ?? 'Remedies'} />
      <SearchBox
        value={search}
        onChange={setSearch}
        label="Search remedies"
        placeholder="Search remedies..."
      />

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        {chips.map(chip => (
          <button
            key={chip.id ?? 'all'}
            type="button"
            aria-pressed={tag === chip.id}
            onClick={() => setTag(tag === chip.id ? null : chip.id)}
            className={clsx(
              'shrink-0 rounded-full border px-4 py-1.5 text-[15px]',
              tag === chip.id
                ? 'border-primary bg-primary text-white'
                : 'border-[#c9837a] text-primary',
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {list.isError && !all.length ? (
        <div className="py-16 text-center text-[17px] text-[#4a1a1a]">
          <p>We could not load the remedies.</p>
          <button
            type="button"
            onClick={() => list.refetch()}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      ) : !loadingFirstPage && remedies.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Gem className="h-14 w-14 text-primary/60" aria-hidden />
          <p className="font-raleway text-[20px] font-semibold text-primary">No Remedies Found</p>
          <p className="text-[15px] text-[#79787A]">
            {all.length
              ? 'Nothing matches your search.'
              : 'No remedies are available at the moment.'}
          </p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {loadingFirstPage
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <RemedyCardSkeleton />
                </li>
              ))
            : remedies.map(remedy => (
                <li key={remedy.id} className="flex">
                  <RemedyCard remedy={remedy} />
                </li>
              ))}
        </ul>
      )}

      <div ref={end} aria-hidden />
      {isFetchingNextPage ? (
        <div className="flex justify-center py-6" role="status" aria-label="Loading more remedies">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : hasNextPage ? (
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className="rounded-full bg-primary px-6 py-2.5 text-[16px] text-white"
          >
            Show more
          </button>
        </div>
      ) : null}

      <GoToCartBar />
    </div>
  );
}
