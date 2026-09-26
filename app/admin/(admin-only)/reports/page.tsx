'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContentReports } from '@/hooks/use-content-reports';
import ContentReportsTable from '@/components/admin/content-reports/content-reports-table';
import type { ReportStatus } from '@/lib/content-reports-api';

const DEFAULT_LIMIT = 20;
const STATUS_TABS = ['PENDING', 'RESOLVED', 'DISMISSED', 'ALL'] as const;
type StatusTab = (typeof STATUS_TABS)[number];
const TAB_LABELS: Record<StatusTab, string> = {
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
  ALL: 'All',
};

export default function ContentReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusParam = searchParams.get('status');
  const activeTab: StatusTab = STATUS_TABS.includes(statusParam as StatusTab)
    ? (statusParam as StatusTab)
    : 'PENDING';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT)));

  const { data, isLoading, isFetching, isError } = useContentReports(
    page,
    limit,
    activeTab === 'ALL' ? undefined : (activeTab as ReportStatus),
  );

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => params.set(key, value));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Content Reports</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          Reports submitted from the app about users, messages, live comments, streams and reviews.
          Review pending reports within 24 hours.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Tabs value={activeTab} onValueChange={next => updateParams({ status: next, page: '1' })}>
          <TabsList>
            {STATUS_TABS.map(tab => (
              <TabsTrigger key={tab} value={tab} className="font-mukta text-sm">
                {TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {data && !isLoading && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mukta text-xs font-medium text-neutral-600">
            {data.total} {activeTab === 'ALL' ? 'reports' : TAB_LABELS[activeTab].toLowerCase()}
          </span>
        )}
      </div>

      <Card className="rounded-2xl border-neutral-100 shadow-sm">
        <CardContent className="p-0">
          {isError ? (
            <p className="px-6 py-10 text-center font-mukta text-sm text-red-500">
              Failed to load reports. Please try again.
            </p>
          ) : (
            <ContentReportsTable
              data={data?.items ?? []}
              isLoading={isLoading}
              isFetching={isFetching}
              page={page}
              limit={limit}
              total={data?.total ?? 0}
              onPageChange={next => updateParams({ page: String(next) })}
              onLimitChange={next => updateParams({ limit: String(next), page: '1' })}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
