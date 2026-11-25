'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EllipsisVertical, Loader2, Pencil, ScrollText, Search, Trash2 } from 'lucide-react';
import clsx from 'clsx';

import { ConfirmDialog } from '@/components/account/confirm-dialog';
import { useBackendClient } from '@/hooks/use-backend-client';
import {
  formatTime12h,
  historyPath,
  matchScoreLabel,
  nextHistoryPage,
  REPORT_API,
  reportEditPath,
  reportPath,
  toKundaliRow,
  toMatchRow,
  type HistoryPage,
  type KundaliRow,
  type MatchRow,
  type ReportTab,
  type SavedKundali,
  type SavedMatch,
} from '@/lib/astro-reports/reports';

const AVATAR = {
  male: '/images/astro-reports/male.png',
  female: '/images/astro-reports/female.png',
};

const TABS: { id: ReportTab; label: string; create: string; createHref: string }[] = [
  {
    id: 'kundali',
    label: 'Kundali Report',
    create: 'Create New Kundali',
    createHref: '/free-kundali',
  },
  {
    id: 'match',
    label: 'Match Report',
    create: 'Create Match Making',
    createHref: '/kundali-matching',
  },
];

export const reportsKey = (tab: ReportTab) => ['astro-reports', tab] as const;

/** Astro Reports (Figma Home/Astro-Report-*, the app's KundaliAstroReportsScreen): saved kundalis and matches. */
export function AstroReports({ initialTab }: { initialTab: ReportTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<ReportTab>(initialTab);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  // The backend searches by name; wait for a pause in typing, as the app does.
  useEffect(() => {
    const t = window.setTimeout(() => setQuery(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  const pickTab = (next: ReportTab) => {
    setTab(next);
    // Kept in the URL so "back" from a report lands on the same tab.
    router.replace(next === 'match' ? `${pathname}?tab=match` : pathname, { scroll: false });
  };

  const current = TABS.find(t => t.id === tab)!;

  return (
    <div className="flex w-full flex-col pb-24 lg:pb-0">
      <h1 className="mb-5 text-center text-[28px] font-normal text-primary lg:text-left lg:text-[34px]">
        Astro Reports
      </h1>

      <label className="relative mb-4 block">
        <span className="sr-only">Search by name</span>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4a1a1a]"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === 'match' ? 'Search match by name' : 'Search Kundali by name'}
          className="h-[48px] w-full rounded-full border border-[#720A0B] bg-transparent pl-12 pr-5 font-app text-[16px] text-[#4a1a1a] outline-none"
        />
      </label>

      <div
        role="tablist"
        aria-label="Report type"
        className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-[#720A0B]/50 p-1.5"
      >
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => pickTab(t.id)}
            className={clsx(
              'h-[44px] rounded-full font-app text-[17px] transition-colors',
              tab === t.id ? 'bg-primary text-white' : 'text-primary hover:bg-primary/5',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'kundali' ? (
        <ReportList key={`k-${query}`} tab="kundali" query={query} />
      ) : (
        <ReportList key={`m-${query}`} tab="match" query={query} />
      )}

      {/* Phone: pinned above the bottom tabs like the app's footer button. Desktop: under the list. */}
      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 px-4 lg:static lg:mt-6 lg:px-0">
        <Link
          href={current.createHref}
          className="mx-auto flex h-[52px] w-full max-w-[560px] items-center justify-center rounded-full bg-primary font-app text-[18px] text-white shadow-[0_8px_24px_rgba(97,21,8,0.25)] lg:mx-0 lg:w-auto lg:max-w-none lg:px-10 lg:shadow-none"
        >
          {current.create}
        </Link>
      </div>
    </div>
  );
}

function ReportList({ tab, query }: { tab: ReportTab; query: string }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const list = useInfiniteQuery({
    queryKey: [...reportsKey(tab), query],
    queryFn: async ({ pageParam }) => {
      const data = await backend.get<HistoryPage<SavedKundali | SavedMatch>>(
        historyPath(tab, pageParam, query),
      );
      return Array.isArray(data?.items) ? data.items : [];
    },
    initialPageParam: 1,
    getNextPageParam: (last, all) => nextHistoryPage(last.length, all.length),
  });

  const rows = useMemo(() => (list.data?.pages ?? []).flat(), [list.data]);

  const remove = useMutation({
    mutationFn: (id: string) => backend.delete(`${REPORT_API[tab]}/${id}`),
    onSuccess: () => {
      setToDelete(null);
      void queryClient.invalidateQueries({ queryKey: reportsKey(tab) });
    },
  });

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

  if (list.isPending) {
    return (
      <div className="flex justify-center py-20" role="status" aria-label="Loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (list.isError) {
    return (
      <div className="py-16 text-center font-app text-[17px] text-[#4a1a1a]">
        <p>We could not load your reports.</p>
        <button
          type="button"
          onClick={() => list.refetch()}
          className="mt-2 text-primary underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ScrollText className="h-16 w-16 text-primary" strokeWidth={1.25} aria-hidden />
        <p className="font-app text-[20px] text-primary">
          {query
            ? `No reports match “${query}”.`
            : tab === 'kundali'
              ? 'No kundali reports yet.'
              : 'No match reports yet.'}
        </p>
        {!query ? (
          <p className="max-w-[360px] font-app text-[15px] text-[#6d6d6d]">
            {tab === 'kundali'
              ? 'Every kundali you make while logged in is saved here.'
              : 'Every match making you do while logged in is saved here.'}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <ul
        aria-label="Saved reports"
        className="grid grid-cols-[minmax(0,1fr)] gap-2.5 xl:grid-cols-2"
      >
        {rows.map(item =>
          tab === 'kundali' ? (
            <KundaliCard
              key={item._id}
              row={toKundaliRow(item as SavedKundali)}
              onDelete={setToDelete}
            />
          ) : (
            <MatchCard key={item._id} row={toMatchRow(item as SavedMatch)} onDelete={setToDelete} />
          ),
        )}
      </ul>
      <div ref={end} aria-hidden />
      {isFetchingNextPage ? (
        <div className="flex justify-center py-6" role="status" aria-label="Loading more">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : null}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={open => {
          if (!open) {
            setToDelete(null);
            remove.reset();
          }
        }}
        title="Delete this report?"
        message={
          toDelete?.name ? `${toDelete.name} will be removed from your Astro Reports.` : undefined
        }
        confirmText="Delete"
        cancelText="Cancel"
        busy={remove.isPending}
        error={remove.isError ? 'Could not delete it. Please try again.' : null}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}

const cardClass =
  'relative flex min-w-0 items-center gap-4 rounded-[10px] border border-[#720A0B]/45 bg-[#FBF3DF] p-3 pr-11 transition-colors hover:border-[#720A0B]';

function Avatar({ gender }: { gender: 'male' | 'female' }) {
  return (
    <span className="relative block h-[56px] w-[56px] shrink-0 overflow-hidden rounded-full bg-[#FFEBCC]">
      <Image src={AVATAR[gender]} alt="" fill sizes="56px" className="object-cover" />
    </span>
  );
}

function KundaliCard({
  row,
  onDelete,
}: {
  row: KundaliRow;
  onDelete: (target: { id: string; name: string }) => void;
}) {
  const details = [
    row.date,
    row.time ? formatTime12h(row.time) : '',
    row.gender ? row.gender[0].toUpperCase() + row.gender.slice(1) : '',
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <li className={cardClass}>
      <Avatar gender={row.gender === 'female' ? 'female' : 'male'} />
      <Link
        href={reportPath('kundali', row.id)}
        className="min-w-0 flex-1 after:absolute after:inset-0 after:rounded-[10px] after:content-['']"
      >
        <span className="block truncate font-app text-[17px] text-primary">
          {row.name || 'Unnamed report'}
        </span>
        <span className="block truncate font-app text-[14px] text-[#B5655F]">{details}</span>
        <span className="block truncate font-app text-[14px] text-[#2f2f2f]">
          {row.place || '-'}
        </span>
      </Link>
      <RowMenu
        editHref={reportEditPath('kundali', row.id)}
        onDelete={() => onDelete({ id: row.id, name: row.name })}
      />
    </li>
  );
}

function MatchCard({
  row,
  onDelete,
}: {
  row: MatchRow;
  onDelete: (target: { id: string; name: string }) => void;
}) {
  const names = `${row.manName || 'Man'} & ${row.womanName || 'Woman'}`;
  const score = matchScoreLabel(row);
  const fallback = [row.date, row.time ? formatTime12h(row.time) : '', 'Matched']
    .filter(Boolean)
    .join(', ');
  return (
    <li className={cardClass}>
      <span className="flex shrink-0">
        <Avatar gender="male" />
        <span className="-ml-2">
          <Avatar gender="female" />
        </span>
      </span>
      <Link
        href={reportPath('match', row.id)}
        className="min-w-0 flex-1 after:absolute after:inset-0 after:rounded-[10px] after:content-['']"
      >
        <span className="block truncate font-app text-[17px] text-primary">{names}</span>
        <span className="block truncate font-app text-[14px] text-[#B5655F]">
          {score || fallback}
        </span>
        <span className="block truncate font-app text-[14px] text-[#2f2f2f]">
          {row.place || '-'}
        </span>
      </Link>
      <RowMenu
        editHref={reportEditPath('match', row.id)}
        onDelete={() => onDelete({ id: row.id, name: names })}
      />
    </li>
  );
}

function RowMenu({ editHref, onDelete }: { editHref: string; onDelete: () => void }) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label="Report options"
        className="absolute right-1.5 top-1.5 z-10 rounded-full p-2 text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <EllipsisVertical className="h-5 w-5" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-[70] min-w-[140px] rounded-xl border border-[#720A0B]/30 bg-[#FAF6E3] p-1.5 shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link
              href={editHref}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 font-app text-[15px] text-primary outline-none data-[highlighted]:bg-primary/10"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-dashed border-[#720A0B]/30" />
          <DropdownMenu.Item
            onSelect={onDelete}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 font-app text-[15px] text-[#B5655F] outline-none data-[highlighted]:bg-primary/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
