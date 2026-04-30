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
import type { RemediesCategory } from '@/lib/remedies-category-api';
import { createColumns } from './columns';

interface RemediesCategoryTableProps {
  data: RemediesCategory[];
  isLoading: boolean;
  onEdit: (row: RemediesCategory) => void;
  onDelete: (row: RemediesCategory) => void;
}

export default function RemediesCategoryTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: RemediesCategoryTableProps) {
  const columns = createColumns({ onEdit, onDelete });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
          Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i} className="border-neutral-100">
              {Array.from({ length: 5 }).map((_, j) => (
                <TableCell key={j}>
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
              className="py-8 text-center font-mukta text-neutral-400"
            >
              No remedies categories found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
