'use client'; 

import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RemediesCategory } from '@/lib/remedies-category-api';

interface ColumnActions {
  onEdit: (row: RemediesCategory) => void;
  onDelete: (row: RemediesCategory) => void;
}

export function createColumns({ onEdit, onDelete }: ColumnActions): ColumnDef<RemediesCategory>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className="font-mukta font-medium text-neutral-800">{row.original.title}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span
          className="font-mukta text-neutral-600 block max-w-xs truncate"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const image = row.original.image;
        if (!image) return <span className="font-mukta text-sm text-neutral-400">—</span>;
        return (
          <img
            src={image.url}
            alt={row.original.title}
            className="h-10 w-10 rounded-lg object-cover"
          />
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return (
          <span className="whitespace-nowrap font-mukta text-sm text-neutral-500">
            {date
              ? new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-[#611508]"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-red-600"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
