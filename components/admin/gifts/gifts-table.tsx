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
import type { Gift } from '@/lib/gifts-api';

interface GiftsTableProps {
  data: Gift[];
  isLoading: boolean;
  onEdit: (row: Gift) => void;
  onDelete: (row: Gift) => void;
}

export default function GiftsTable({ data, isLoading, onEdit, onDelete }: GiftsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-neutral-100">
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Title
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Image
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Price
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Status
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
              {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))}

        {!isLoading &&
          data.map((row, index) => (
            <TableRow
              key={`${row.title}-${row.createdAt ?? 'no-date'}-${index}`}
              className="border-neutral-100 hover:bg-neutral-50"
            >
              <TableCell>
                <span className="font-mukta font-medium text-neutral-800">{row.title}</span>
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
                <span className="whitespace-nowrap font-mukta text-sm text-neutral-600">
                  NPR {row.prices.npr} · INR {row.prices.inr} · USD {row.prices.usd}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`font-mukta text-xs px-2 py-0.5 rounded-full ${
                    row.isActive ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {row.isActive ? 'Active' : 'Inactive'}
                </span>
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
            <TableCell colSpan={6} className="py-8 text-center font-mukta text-neutral-400">
              No gifts found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
