'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnpaidEarnings, useRecentPayouts } from '@/hooks/use-payouts';
import PayoutsTable from '@/components/admin/payouts/payouts-table';
import RecentPayoutsTable from '@/components/admin/payouts/recent-payouts-table';

const DEFAULT_LIMIT = 20;
const TABS = ['unpaid', 'recent'] as const;
type PayoutsTab = (typeof TABS)[number];

export default function PayoutsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const activeTab: PayoutsTab = TABS.includes(tabParam as PayoutsTab)
    ? (tabParam as PayoutsTab)
    : 'unpaid';

  function handleTabChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    router.push(`?${params.toString()}`);
  }

  // Unpaid tab state
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT)));
  const search = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading, isFetching, isError } = useUnpaidEarnings(
    page,
    limit,
    search || undefined,
  );

  function handlePageChange(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(next));
    router.push(`?${params.toString()}`);
  }

  function handleLimitChange(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', String(next));
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  // Recent payouts tab state
  const paidPage = Math.max(1, Number(searchParams.get('paidPage') ?? '1'));
  const paidLimit = Math.max(1, Number(searchParams.get('paidLimit') ?? String(DEFAULT_LIMIT)));
  const paidSearch = searchParams.get('paidSearch') ?? '';
  const [paidSearchInput, setPaidSearchInput] = useState(paidSearch);

  const {
    data: recentPayoutsData,
    isLoading: isRecentPayoutsLoading,
    isFetching: isRecentPayoutsFetching,
    isError: isRecentPayoutsError,
  } = useRecentPayouts(paidPage, paidLimit, paidSearch || undefined);

  function handlePaidPageChange(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('paidPage', String(next));
    router.push(`?${params.toString()}`);
  }

  function handlePaidLimitChange(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('paidLimit', String(next));
    params.set('paidPage', '1');
    router.push(`?${params.toString()}`);
  }

  function handlePaidSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (paidSearchInput) {
      params.set('paidSearch', paidSearchInput);
    } else {
      params.delete('paidSearch');
    }
    params.set('paidPage', '1');
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Payouts</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          Manage astrologer payouts — mark unpaid earnings as paid after transferring the money
          manually
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="unpaid" className="font-mukta text-sm">
            Unpaid
          </TabsTrigger>
          <TabsTrigger value="recent" className="font-mukta text-sm">
            Recent Payouts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by name or email"
                className="h-8 max-w-xs font-mukta text-sm"
              />
            </form>
            {data && !isLoading && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mukta text-xs font-medium text-neutral-600">
                {data.total} astrologers awaiting payout
              </span>
            )}
          </div>

          <Card className="rounded-2xl border-neutral-100 shadow-sm">
            <CardContent className="p-0">
              {isError ? (
                <p className="px-6 py-10 text-center font-mukta text-sm text-red-500">
                  Failed to load unpaid earnings. Please try again.
                </p>
              ) : (
                <PayoutsTable
                  data={data?.items ?? []}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  page={page}
                  limit={limit}
                  total={data?.total ?? 0}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <form onSubmit={handlePaidSearchSubmit} className="flex items-center gap-2">
              <Input
                value={paidSearchInput}
                onChange={e => setPaidSearchInput(e.target.value)}
                placeholder="Search by name or email"
                className="h-8 max-w-xs font-mukta text-sm"
              />
            </form>
            {recentPayoutsData && !isRecentPayoutsLoading && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mukta text-xs font-medium text-neutral-600">
                {recentPayoutsData.total} payouts made
              </span>
            )}
          </div>

          <Card className="rounded-2xl border-neutral-100 shadow-sm">
            <CardContent className="p-0">
              {isRecentPayoutsError ? (
                <p className="px-6 py-10 text-center font-mukta text-sm text-red-500">
                  Failed to load recent payouts. Please try again.
                </p>
              ) : (
                <RecentPayoutsTable
                  data={recentPayoutsData?.items ?? []}
                  isLoading={isRecentPayoutsLoading}
                  isFetching={isRecentPayoutsFetching}
                  page={paidPage}
                  limit={paidLimit}
                  total={recentPayoutsData?.total ?? 0}
                  onPageChange={handlePaidPageChange}
                  onLimitChange={handlePaidLimitChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
