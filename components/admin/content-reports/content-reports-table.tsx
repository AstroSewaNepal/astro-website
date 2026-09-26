'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import type { ContentReportRow } from '@/lib/content-reports-api';
import { ReviewReportDialog } from './review-report-dialog';
import { REASON_LABELS, STATUS_LABELS, STATUS_STYLES, TARGET_LABELS } from './report-labels';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const SKELETON_ROW_IDS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'];
const COLUMN_COUNT = 7;

interface ContentReportsTableProps {
  data: ContentReportRow[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function ReportActionCell({ row }: { row: ContentReportRow }) {
  const [open, setOpen] = useState(false);
  const isPending = row.status === 'PENDING';
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={isPending ? 'default' : 'outline'}
        onClick={() => setOpen(true)}
        className={`h-7 font-mukta text-xs ${isPending ? 'text-white' : ''}`}
        style={isPending ? { backgroundColor: '#611508' } : undefined}
      >
        {isPending ? 'Review' : 'View'}
      </Button>
      <ReviewReportDialog open={open} onOpenChange={setOpen} row={row} />
    </>
  );
}

function UserCell({ user }: { user: ContentReportRow['reporter'] }) {
  return (
    <div className="font-mukta">
      <p className="text-sm text-neutral-800">
        {user?.fullName ?? '—'}
        {user?.isSuspended && (
          <span className="ml-1.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
            Suspended
          </span>
        )}
      </p>
      <p className="text-xs text-neutral-400">{user?.email ?? 'Deleted user'}</p>
    </div>
  );
}

export default function ContentReportsTable({
  data,
  isLoading,
  isFetching,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: ContentReportsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity duration-150' : ''}>
      <Table>
        <TableHeader>
          <TableRow className="border-neutral-100">
            {['Submitted', 'Type', 'Reason', 'Reported user', 'Reported by', 'Status', ''].map(
              (label, i) => (
                <TableHead
                  key={label || `col-${i}`}
                  className="font-mukta text-xs uppercase tracking-wide text-neutral-500"
                >
                  {label}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            SKELETON_ROW_IDS.slice(0, Math.min(limit, SKELETON_ROW_IDS.length)).map(rowId => (
              <TableRow key={rowId} className="border-neutral-100">
                {Array.from({ length: COLUMN_COUNT }, (_, i) => (
                  <TableCell key={`${rowId}-${i}`}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            data.map(row => (
              <TableRow key={row._id} className="border-neutral-100 hover:bg-neutral-50">
                <TableCell>
                  <span className="font-mukta text-sm text-neutral-600">
                    {new Date(row.createdAt).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mukta text-sm text-neutral-800">
                    {TARGET_LABELS[row.targetType]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mukta text-sm text-neutral-600">
                    {REASON_LABELS[row.reason] ?? row.reason}
                  </span>
                </TableCell>
                <TableCell>
                  <UserCell user={row.reportedUser} />
                </TableCell>
                <TableCell>
                  <UserCell user={row.reporter} />
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mukta text-xs font-medium ${STATUS_STYLES[row.status].pill}`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_STYLES[row.status].dot}`}
                    />
                    {STATUS_LABELS[row.status]}
                  </span>
                </TableCell>
                <TableCell>
                  <ReportActionCell row={row} />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT}
                className="py-10 text-center font-mukta text-sm text-neutral-400"
              >
                No reports
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div
        className="flex items-center justify-end gap-6 border-t px-4"
        style={{
          height: 52,
          borderColor: 'rgba(224, 224, 224, 1)',
          fontSize: '0.875rem',
          color: 'rgba(0,0,0,0.87)',
        }}
      >
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

        <span
          className="font-mukta text-sm"
          style={{ color: 'rgba(0,0,0,0.6)', minWidth: 80, textAlign: 'right' }}
        >
          {from}–{to} of {total}
        </span>

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
