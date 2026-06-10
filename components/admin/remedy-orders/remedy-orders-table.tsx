'use client';

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { createColumns } from './columns';
import type { AdminRemedyOrder } from '@/lib/remedy-order-api';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const SKELETON_ROW_IDS = [
  'sk-1',
  'sk-2',
  'sk-3',
  'sk-4',
  'sk-5',
  'sk-6',
  'sk-7',
  'sk-8',
  'sk-9',
  'sk-10',
];

interface RemedyOrdersTableProps {
  data: AdminRemedyOrder[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onStatusChange: (id: string, status: string) => void;
  pendingId: string | null;
}

export default function RemedyOrdersTable({
  data,
  isLoading,
  isFetching,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onStatusChange,
  pendingId,
}: RemedyOrdersTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const columns = createColumns({ onStatusChange, pendingId });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity duration-150' : ''}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="border-neutral-100">
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className="font-mukta text-xs uppercase tracking-wide text-neutral-500"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading &&
            SKELETON_ROW_IDS.slice(0, Math.min(limit, SKELETON_ROW_IDS.length)).map(rowId => (
              <TableRow key={rowId} className="border-neutral-100">
                {table.getAllColumns().map(col => (
                  <TableCell key={col.id}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id} className="border-neutral-100 hover:bg-neutral-50">
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center font-mukta text-sm text-neutral-400"
              >
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* MUI DataGrid-style pagination footer */}
      <div
        className="flex items-center justify-end gap-6 border-t px-4"
        style={{
          height: 52,
          borderColor: 'rgba(224, 224, 224, 1)',
          fontSize: '0.875rem',
          color: 'rgba(0,0,0,0.87)',
        }}
      >
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="font-mukta text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>
            Rows per page:
          </span>
          <Select
            value={String(limit)}
            onValueChange={val => {
              onLimitChange(Number(val));
              onPageChange(1);
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-7 w-16 border-none font-mukta text-sm shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROWS_PER_PAGE_OPTIONS.map(opt => (
                <SelectItem key={opt} value={String(opt)} className="font-mukta text-sm">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Range info */}
        <span
          className="font-mukta text-sm"
          style={{ color: 'rgba(0,0,0,0.6)', minWidth: 80, textAlign: 'right' }}
        >
          {from}–{to} of {total}
        </span>

        {/* Navigation icons */}
        <div className="flex items-center">
          {(
            [
              {
                icon: ChevronsLeft,
                label: 'First page',
                disabled: page <= 1,
                action: () => onPageChange(1),
              },
              {
                icon: ChevronLeft,
                label: 'Previous page',
                disabled: page <= 1,
                action: () => onPageChange(page - 1),
              },
              {
                icon: ChevronRight,
                label: 'Next page',
                disabled: page >= totalPages,
                action: () => onPageChange(page + 1),
              },
              {
                icon: ChevronsRight,
                label: 'Last page',
                disabled: page >= totalPages,
                action: () => onPageChange(totalPages),
              },
            ] as const
          ).map(({ icon: Icon, label, disabled, action }) => (
            <button
              key={label}
              aria-label={label}
              onClick={action}
              disabled={disabled || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-neutral-100 disabled:pointer-events-none"
              style={{ color: disabled ? 'rgba(0,0,0,0.26)' : 'rgba(0,0,0,0.54)' }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
