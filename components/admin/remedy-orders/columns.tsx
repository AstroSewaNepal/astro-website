'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2, Info } from 'lucide-react';
import { AdminRemedyOrder } from '@/lib/remedy-order-api';

const STATUS_STYLES: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700',
  in_transit: 'bg-yellow-50 text-yellow-700',
  delivered: 'bg-green-50 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  placed: 'Placed',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

const DELIVERY_LABELS: Record<string, string> = {
  physical: 'Physical',
  online: 'Online',
  onsite: 'Onsite',
  online_digital: 'Digital',
};

/** Options available from each status — forward-only. */
const NEXT_STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  placed: [
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
  ],
  in_transit: [{ value: 'delivered', label: 'Delivered' }],
  delivered: [],
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface ColumnActions {
  onStatusChange: (id: string, status: string) => void;
  pendingId: string | null;
}

export function createColumns({
  onStatusChange,
  pendingId,
}: ColumnActions): ColumnDef<AdminRemedyOrder>[] {
  return [
    {
      accessorKey: 'trackingNumber',
      header: 'Tracking #',
      cell: ({ getValue }) => (
        <span className="font-mukta text-xs font-semibold text-neutral-700">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => (
        <div className="font-mukta">
          <p className="text-sm text-neutral-800">{row.original.userName ?? '—'}</p>
          <p className="text-xs text-neutral-400">{row.original.userEmail ?? '—'}</p>
          {row.original.userPhone && (
            <p className="text-xs text-neutral-400">{row.original.userPhone}</p>
          )}
        </div>
      ),
    },
    {
      id: 'astrologers',
      header: 'Astrologer',
      cell: ({ row }) => {
        const astrologers = row.original.astrologers ?? [];
        if (astrologers.length === 0) {
          return <span className="font-mukta text-sm text-neutral-400">—</span>;
        }
        return (
          <div className="flex flex-col gap-1 font-mukta">
            {astrologers.map(a => (
              <div key={a.id} className="flex items-center gap-1">
                <span className="text-sm text-neutral-800">{a.name}</span>
                <div className="group relative">
                  <Info size={12} className="shrink-0 cursor-pointer text-neutral-400" />
                  {/* Tooltip anchored above the icon */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden w-48 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-lg group-hover:block">
                    <p className="mb-1 text-xs font-semibold text-neutral-500">Remedies ordered</p>
                    <ul className="space-y-0.5">
                      {a.remedyNames.map(name => (
                        <li key={name} className="text-xs text-neutral-700">• {name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mukta text-xs font-medium ${STATUS_STYLES[status] ?? ''}`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                status === 'placed'
                  ? 'bg-blue-500'
                  : status === 'in_transit'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
            />
            {STATUS_LABELS[status] ?? status}
          </span>
        );
      },
    },
    {
      accessorKey: 'deliveryTypes',
      header: 'Delivery',
      cell: ({ getValue }) => {
        const types = getValue<string[] | null | undefined>() ?? [];
        return (
          <div className="flex flex-wrap gap-1">
            {types.map(type => (
              <span
                key={type}
                className="inline-flex items-center rounded border border-neutral-200 px-1.5 py-0.5 font-mukta text-xs text-neutral-600"
              >
                {DELIVERY_LABELS[type] ?? type}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Remedies',
      cell: ({ getValue }) => (
        <span className="font-mukta text-sm text-neutral-600">
          {(getValue<AdminRemedyOrder['items'] | null | undefined>() ?? []).length}
        </span>
      ),
    },
    {
      accessorKey: 'grandTotal',
      header: 'Total (NPR)',
      cell: ({ row }) => (
        <div className="font-mukta">
          <span className="text-sm font-semibold text-neutral-800">
            {(row.original.grandTotal ?? 0).toLocaleString()}
          </span>
          {row.original.totalDeliveryCharge > 0 && (
            <p className="text-xs text-neutral-400">
              incl. {row.original.totalDeliveryCharge.toLocaleString()} delivery
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="font-mukta text-sm text-neutral-500">
          {formatDate(getValue<string>())}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const status = row.original.status;
        const options = NEXT_STATUS_OPTIONS[status] ?? [];
        const isPending = pendingId === row.original.id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40"
                disabled={isPending}
                aria-label="Row actions"
              >
                {isPending ? (
                  <Loader2 size={15} className="animate-spin text-neutral-500" />
                ) : (
                  <MoreHorizontal size={15} className="text-neutral-500" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-mukta">
              <DropdownMenuLabel className="text-xs text-neutral-400">
                Change Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {options.length === 0 ? (
                <DropdownMenuItem disabled className="text-xs text-neutral-400">
                  No further transitions
                </DropdownMenuItem>
              ) : (
                options.map(opt => (
                  <DropdownMenuItem
                    key={opt.value}
                    className="text-xs"
                    onSelect={() => onStatusChange(row.original.id, opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
