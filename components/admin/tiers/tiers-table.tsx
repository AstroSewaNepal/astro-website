'use client';

import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Tier } from '@/lib/tier-api';

type TiersTableProps = {
  tiers: Tier[];
  onEdit: (tier: Tier) => void;
  onDelete: (tier: Tier) => void;
};

export function TiersTable({ tiers, onEdit, onDelete }: TiersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-neutral-100">
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Name
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Commission %
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tiers.map(tier => (
          <TableRow key={tier._id} className="border-neutral-100 hover:bg-neutral-50">
            <TableCell>
              <span className="font-mukta text-sm text-neutral-800">{tier.name}</span>
            </TableCell>
            <TableCell>
              <span className="font-mukta text-sm text-neutral-600">
                {tier.commissionPercentage}%
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Edit ${tier.name}`}
                  onClick={() => onEdit(tier)}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-neutral-100"
                >
                  <Pencil size={14} className="text-neutral-500" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${tier.name}`}
                  onClick={() => onDelete(tier)}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-neutral-100"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
