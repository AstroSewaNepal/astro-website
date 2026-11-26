'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAdminAstrologers } from '@/hooks/use-astrologers';
import AstrologersTable from '@/components/admin/astrologers/astrologers-table';

const DEFAULT_LIMIT = 20;

export default function AstrologersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT)));
  const search = searchParams.get('search') ?? '';
  const freeOnly = searchParams.get('free') === '1';
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading, isFetching, isError } = useAdminAstrologers(
    page,
    limit,
    search || undefined,
    freeOnly,
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

  function handleFreeOnlyChange(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('free', '1');
    else params.delete('free');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Astrologers</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          Approved astrologers and their tiers — the tier sets the consultation commission
          {data && !isLoading && (
            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {data.total} astrologers
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name or email"
            className="h-8 w-72 max-w-full font-mukta text-sm"
          />
        </form>
        <label className="flex cursor-pointer items-center gap-2 font-mukta text-sm text-neutral-600">
          <Switch checked={freeOnly} onCheckedChange={handleFreeOnlyChange} />
          Free chat astrologers only
        </label>
      </div>

      <Card className="rounded-2xl border-neutral-100 shadow-sm">
        <CardContent className="p-0">
          {isError ? (
            <p className="px-6 py-10 text-center font-mukta text-sm text-red-500">
              Failed to load astrologers. Please try again.
            </p>
          ) : (
            <AstrologersTable
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
    </div>
  );
}
