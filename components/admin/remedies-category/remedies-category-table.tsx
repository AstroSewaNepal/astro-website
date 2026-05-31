'use client';

import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { RemediesCategory } from '@/lib/remedies-category-api';

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
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-neutral-100">
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Title
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Description
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Image
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Created At
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Actions
          </TableHead>
        </TableRow>
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
          data.map(row => (
            <TableRow key={row.id ?? row.title} className="border-neutral-100 hover:bg-neutral-50">
              <TableCell>
                <span className="font-mukta font-medium text-neutral-800">{row.title}</span>
              </TableCell>
              <TableCell>
                <span className="font-mukta text-neutral-600 block max-w-xs truncate" title={row.description}>
                  {row.description}
                </span>
              </TableCell>
              <TableCell>
                {row.image ? (
                  <Image
                    src={row.image.url}
                    alt={row.title}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="font-mukta text-sm text-neutral-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="whitespace-nowrap font-mukta text-sm text-neutral-500">
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-500 hover:text-[#611508]"
                    onClick={() => onEdit(row)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-500 hover:text-red-600"
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && data.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
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
