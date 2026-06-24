'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import { useAdminRemedyOrders, useUpdateRemedyOrderStatus } from '@/hooks/use-remedy-orders';
import RemedyOrdersTable from '@/components/admin/remedy-orders/remedy-orders-table';

const DEFAULT_LIMIT = 20;

const STATUS_OPTIONS = [
  { value: 'placed', label: 'Placed' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
];

export default function RemedyOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT)));
  const rawStatus = searchParams.get('status');
  // No param on first load → default to 'placed'; explicit 'all' → show everything
  const statusFilter = rawStatus === null ? 'placed' : rawStatus === 'all' ? '' : rawStatus;

  const { data, isLoading, isFetching, isError } = useAdminRemedyOrders(
    page,
    limit,
    statusFilter || undefined,
  );
  const statusMutation = useUpdateRemedyOrderStatus();
  const pendingId = statusMutation.isPending ? (statusMutation.variables?.id ?? null) : null;

  const allOrders = data?.orders ?? [];
  const filteredOrders = statusFilter
    ? allOrders.filter(o => o.status === statusFilter)
    : allOrders;
  const filteredTotal = statusFilter ? filteredOrders.length : (data?.total ?? 0);

  function handleStatusChange(id: string, status: string) {
    statusMutation.mutate({ id, status });
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

  function handleStatusFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    // Empty value = "show all"; write 'all' so the page doesn't snap back to the placed default
    params.set('status', value || 'all');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  const activeLabel = statusFilter
    ? STATUS_OPTIONS.find(o => o.value === statusFilter)?.label
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Astrologers & Products</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          All user remedy orders — sorted by date (oldest first)
          {data && !isLoading && (
            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {filteredTotal} total
            </span>
          )}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1.5 font-mukta text-sm ${statusFilter ? 'border-neutral-800 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white' : ''}`}
            >
              Status
              {activeLabel && <span className="font-medium">: {activeLabel}</span>}
              <ChevronDown size={13} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="font-mukta">
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={handleStatusFilter}>
              {STATUS_OPTIONS.map(opt => (
                <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-sm">
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            {statusFilter && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={() => handleStatusFilter('')}
                  className="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-800"
                >
                  <X size={11} /> Clear filter
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="rounded-2xl border-neutral-100 shadow-sm">
        <CardContent className="p-0">
          {isError ? (
            <p className="px-6 py-10 text-center font-mukta text-sm text-red-500">
              Failed to load orders. Please try again.
            </p>
          ) : (
            <RemedyOrdersTable
              data={filteredOrders}
              isLoading={isLoading}
              isFetching={isFetching}
              page={page}
              limit={limit}
              total={filteredTotal}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onStatusChange={handleStatusChange}
              pendingId={pendingId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
