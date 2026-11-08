'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { CreditCard, Loader2, ReceiptText, Search, X } from 'lucide-react';
import clsx from 'clsx';

import { SortSheet, type SortFilter } from '@/components/booking/sort-sheet';
import { useBackendClient } from '@/hooks/use-backend-client';
import {
  TRANSACTION_FILTERS,
  type TransactionFilter,
  type TransactionKind,
  type TransactionsPage,
  type TransactionView,
  nextTransactionsPage,
  transactionTime,
  transactionView,
  transactionsPath,
} from '@/lib/payments/transactions';

const SEARCH_DELAY_MS = 400;

const KIND_STYLE: Record<TransactionKind, string> = {
  consultation: 'bg-[#e8f1fd] text-[#1e5bb8]',
  remedy: 'bg-[#fdeedd] text-[#b35a00]',
  gift: 'bg-[#f6dcd7] text-primary',
  live: 'bg-[#e3f4e6] text-[#1d7a35]',
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-[#fdeedd] text-[#b35a00]',
  CONFIRMED: 'bg-[#e8f1fd] text-[#1e5bb8]',
  COMPLETED: 'bg-[#e3f4e6] text-[#1d7a35]',
  CANCELLED: 'bg-[#fdecea] text-[#b3261e]',
  placed: 'bg-primary text-white',
  in_transit: 'bg-[#e8f1fd] text-[#1e5bb8]',
  delivered: 'bg-[#e3f4e6] text-[#1d7a35]',
};

/** The app's My Payments: every payment (consultations, remedies, gifts, live calls), searchable and filterable. */
export function MyPayments() {
  const backend = useBackendClient();
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<SortFilter<TransactionFilter>>({
    sort: 'all',
    from: '',
    to: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { sort: type, from, to } = filters;
  const list = useInfiniteQuery({
    queryKey: ['payments', 'history', type, search, from, to],
    queryFn: ({ pageParam }) =>
      backend.get<TransactionsPage>(transactionsPath({ page: pageParam, type, search, from, to })),
    initialPageParam: 1,
    getNextPageParam: last => nextTransactionsPage(last),
    placeholderData: keepPreviousData,
  });
  const cards = useMemo(
    () =>
      (list.data?.pages ?? [])
        .flatMap(p => (Array.isArray(p?.transactions) ? p.transactions : []))
        .map(t => ({ id: t.id, view: transactionView(t) }))
        .filter((c): c is { id: string; view: TransactionView } => c.view !== null),
    [list.data],
  );

  // Infinite scroll, as My Consultations.
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

  const filtered = type !== 'all' || !!from || !!to;

  return (
    <div className="flex w-full flex-col">
      <h1 className="mb-4 text-[28px] font-normal text-primary lg:text-[34px]">My Payments</h1>

      <div className="mb-5 flex items-center gap-2 lg:justify-end lg:border-b lg:border-[#BE7B71]/50 lg:pb-5">
        <label className="relative block min-w-0 flex-1 lg:w-[380px] lg:flex-none">
          <span className="sr-only">Search</span>
          <input
            type="search"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search"
            enterKeyHint="search"
            className="h-[48px] w-full rounded-full border border-[#c9837a] bg-transparent pl-5 pr-12 font-app text-[16px] text-[#4a1a1a] outline-none focus:border-primary lg:h-11 lg:border-primary lg:bg-[#F8F3DF]"
          />
          {searchText ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          )}
        </label>
        <SortSheet
          value={filters}
          defaultSort="all"
          active={filtered}
          onApply={setFilters}
          options={TRANSACTION_FILTERS}
          title="Filter"
          choiceLabel="Payment type"
        />
      </div>

      {list.isPending ? (
        <div className="flex justify-center py-20" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : list.isError ? (
        <div className="py-16 text-center font-app text-[17px] text-[#4a1a1a]">
          <p>We could not load your payments.</p>
          <button
            type="button"
            onClick={() => list.refetch()}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ReceiptText className="h-14 w-14 text-primary/60" aria-hidden />
          <p className="font-app text-[17px] text-[#4a1a1a]">
            {search || filtered ? 'No payments match your search.' : 'No payments yet'}
          </p>
        </div>
      ) : (
        <>
          <ul
            className={clsx(
              'grid gap-3 lg:grid-cols-2 lg:gap-5',
              list.isPlaceholderData && 'opacity-60',
            )}
          >
            {cards.map(({ id, view }) => (
              <li key={id}>
                <PaymentCard view={view} />
              </li>
            ))}
          </ul>
          <div ref={end} />
          {isFetchingNextPage ? (
            <Loader2
              className="mx-auto my-6 h-6 w-6 animate-spin text-primary"
              aria-label="Loading"
            />
          ) : null}
        </>
      )}
    </div>
  );
}

function PaymentCard({ view }: { view: TransactionView }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl bg-[#F8F3DF] p-4 font-app">
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            'rounded-full px-2.5 py-0.5 text-[12px] font-semibold',
            KIND_STYLE[view.kind],
          )}
        >
          {view.kindLabel}
        </span>
        <span className="flex items-center gap-1 rounded-full border border-[#BE7B71] px-2.5 py-0.5 text-[12px] font-semibold text-[#1C1C1C]">
          {view.method === 'esewa' ? (
            // eslint-disable-next-line @next/next/no-img-element -- static logo
            <img src="/images/payments/esewa.webp" alt="" width={14} height={14} />
          ) : view.method === 'hbl' ? (
            <CreditCard className="h-3.5 w-3.5" aria-hidden />
          ) : null}
          {view.method === 'fonepay' ? (
            <span>
              <span className="text-[#0a0d12]">fone</span>
              <span className="text-[#ce2027]">pay</span>
            </span>
          ) : (
            view.methodLabel
          )}
        </span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[17px] font-semibold text-primary">{view.title}</p>
          {view.subtitle ? <p className="text-[14px] text-[#4a4a4a]">{view.subtitle}</p> : null}
        </div>
        <p className="shrink-0 text-[17px] font-bold text-primary">{view.amount}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-[#BE7B71] pt-3">
        <span className="text-[13px] text-[#6d6d6d]">{transactionTime(view.at)}</span>
        {view.status ? (
          <span
            className={clsx(
              'rounded-full px-2.5 py-0.5 text-[12px] font-semibold',
              STATUS_STYLE[view.status.key] ?? 'bg-[#eee] text-[#333]',
            )}
          >
            {view.status.label}
          </span>
        ) : null}
      </div>
    </article>
  );
}
