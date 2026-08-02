'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  usePendingOnboardingAstrologers,
  useUpdateFinalDecision,
} from '@/hooks/use-astrologer-verification';
import AstrologerVerificationTable from '@/components/admin/astrologer-verification/astrologer-verification-table';

const DEFAULT_LIMIT = 20;

export default function AstrologerVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT)));
  const search = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading, isFetching, isError } = usePendingOnboardingAstrologers(
    page,
    limit,
    search || undefined,
  );
  const decisionMutation = useUpdateFinalDecision();
  const pendingId = decisionMutation.isPending
    ? (decisionMutation.variables?.astrologerId ?? null)
    : null;

  function handleDecision(
    astrologerId: string,
    input: { decision: 'APPROVED' | 'REJECTED'; reason?: string; tierId?: string },
  ) {
    decisionMutation.mutate({ astrologerId, input });
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">
          Astrologer Verification
        </h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          Review and approve or reject pending astrologer applications
          {data && !isLoading && (
            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {data.total} pending
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <Input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search by name or email"
          className="h-8 max-w-xs font-mukta text-sm"
        />
      </form>

      <Card className="rounded-2xl border-neutral-100 shadow-sm">
        <CardContent className="p-0">
          {isError ? (
            <p className="px-6 py-10 text-center font-mukta text-sm text-red-500">
              Failed to load pending applications. Please try again.
            </p>
          ) : (
            <AstrologerVerificationTable
              data={data?.items ?? []}
              isLoading={isLoading}
              isFetching={isFetching}
              page={page}
              limit={limit}
              total={data?.total ?? 0}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onDecision={handleDecision}
              pendingId={pendingId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
