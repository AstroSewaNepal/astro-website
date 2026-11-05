'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Loader2, Search, X } from 'lucide-react';
import clsx from 'clsx';

import { FilterSheet } from '@/components/astrologers/filter-sheet';
import AstrologerCard from '@/components/pages/landing/talk-to-our-astrologer/AstrologerCard';
import AstrologerCardSkeleton from '@/components/pages/landing/talk-to-our-astrologer/AstrologerCardSkeleton';
import type { Astrologer } from '@/components/pages/landing/talk-to-our-astrologer/types';
import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import {
  ALL_TAGS,
  filtersFromSearch,
  type ListFilters,
  listQuery,
  nextPage,
  profilePath,
  searchFromFilters,
} from '@/lib/astrologers/list';

type Tag = { _id?: string; name?: string };
type Language = { id: string; name: string };
type Gender = { value: string; label: string };

const SEARCH_DELAY_MS = 400;

/** Astro Connect (the app's AstroConnectScreen): open to guests; a card's profile asks them to log in. */
export function AstroConnectList() {
  const backend = useBackendClient();
  const router = useRouter();
  const pathname = usePathname() ?? '/astrologers';
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => filtersFromSearch(new URLSearchParams(searchParams?.toString())),
    [searchParams],
  );
  const { countryCode, isResolved } = useBuyerCountry();

  const setFilters = (next: Partial<ListFilters>) =>
    router.replace(`${pathname}${searchFromFilters({ ...filters, ...next })}`, { scroll: false });

  // The box updates the URL once typing pauses, like the app's debounce.
  const [searchText, setSearchText] = useState(filters.search);
  const typed = useRef(false);
  useEffect(() => {
    if (!typed.current) return;
    const timer = setTimeout(() => {
      typed.current = false;
      if (searchText.trim() !== filters.search.trim()) setFilters({ search: searchText });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the typed text starts the timer
  }, [searchText]);

  // Back / Forward change the URL without typing: show its search in the box.
  useEffect(() => {
    if (!typed.current) setSearchText(filters.search);
  }, [filters.search]);

  const tags = useQuery({
    queryKey: ['astrologer-tags', 'expertise'],
    queryFn: () => backend.get<Tag[]>('/astrologer-tags?type=expertise'),
    staleTime: 60 * 60 * 1000,
  });
  const languages = useQuery({
    queryKey: ['languages', 'active'],
    queryFn: () => backend.get<{ languages: Language[] }>('/languages/active'),
    staleTime: 60 * 60 * 1000,
  });
  const genders = useQuery({
    queryKey: ['genders'],
    queryFn: () => backend.get<Gender[]>('/genders'),
    staleTime: Infinity,
  });

  const list = useInfiniteQuery({
    queryKey: ['astrologers', 'list', filters, countryCode],
    queryFn: async ({ pageParam }) => {
      const res = await backend.request<Astrologer[]>(
        'GET',
        listQuery(filters, pageParam, countryCode),
      );
      return { astrologers: Array.isArray(res.data) ? res.data : [], pagination: res.pagination };
    },
    initialPageParam: 1,
    getNextPageParam: last => nextPage(last.pagination, last.astrologers.length),
    placeholderData: keepPreviousData,
    // Wait for the country so prices don't show in NPR first and then switch.
    enabled: isResolved,
  });

  // A page can repeat an astrologer when the order shifts between pages; show each once (the app does the same).
  const astrologers = useMemo(() => {
    const seen = new Set<string>();
    return (list.data?.pages ?? [])
      .flatMap(page => page.astrologers)
      .filter(a => (seen.has(a._id) ? false : (seen.add(a._id), true)));
  }, [list.data]);

  // Infinite scroll: load the next page when the end of the list comes into view.
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
    { id: ALL_TAGS, label: 'All' },
    ...(Array.isArray(tags.data) ? tags.data : [])
      .filter((t): t is Required<Tag> => Boolean(t._id && t.name))
      .map(t => ({ id: t._id, label: t.name })),
  ];
  const loadingFirstPage = !isResolved || (list.isPending && !list.data);

  return (
    <div className="w-full">
      <h1 className="mb-5 text-[28px] font-normal text-primary lg:text-[34px]">
        Talk to Astrologer
      </h1>

      <div className="flex gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search astrologers</span>
          <input
            type="search"
            value={searchText}
            onChange={e => {
              typed.current = true;
              setSearchText(e.target.value);
            }}
            placeholder="Search Astrologers"
            className="h-[48px] w-full rounded-full border border-[#c9837a] bg-transparent pl-5 pr-11 font-mukta text-[16px] text-[#4a1a1a] outline-none focus:border-primary"
          />
          {searchText ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearchText('');
                setFilters({ search: '' });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <Search
              className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary"
              aria-hidden
            />
          )}
        </label>
        <FilterSheet
          filters={filters}
          languages={(languages.data?.languages ?? []).map(l => ({ value: l.name, label: l.name }))}
          genders={Array.isArray(genders.data) ? genders.data : []}
          onApply={setFilters}
        />
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        {chips.map(chip => (
          <button
            key={chip.id}
            type="button"
            aria-pressed={filters.tag === chip.id}
            onClick={() => setFilters({ tag: chip.id })}
            className={clsx(
              'shrink-0 rounded-full border px-4 py-1.5 font-mukta text-[15px]',
              filters.tag === chip.id
                ? 'border-primary bg-primary text-white'
                : 'border-[#c9837a] text-primary',
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
        {loadingFirstPage
          ? Array.from({ length: 6 }, (_, i) => <AstrologerCardSkeleton key={i} />)
          : astrologers.map((astrologer, i) => (
              <AstrologerCard
                key={astrologer._id}
                astrologer={astrologer}
                priorityImage={i < 2}
                profileHref={astrologer.user?._id ? profilePath(astrologer.user._id) : undefined}
              />
            ))}
      </div>

      {list.isError && !astrologers.length ? (
        <div className="py-12 text-center font-mukta text-[17px] text-[#4a1a1a]">
          <p>We could not load astrologers.</p>
          <button
            type="button"
            onClick={() => list.refetch()}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      ) : null}
      {!loadingFirstPage && !list.isError && !astrologers.length ? (
        <p className="py-12 text-center font-mukta text-[17px] text-[#4a1a1a]">
          No astrologer found
        </p>
      ) : null}

      <div ref={end} aria-hidden />
      {isFetchingNextPage ? (
        <div
          className="flex justify-center py-6"
          role="status"
          aria-label="Loading more astrologers"
        >
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : hasNextPage ? (
        // Fallback when the scroll trigger doesn't fire (e.g. a jump straight to the footer).
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
    </div>
  );
}
