'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTiers } from '@/hooks/use-tiers';
import { TiersTable } from './tiers-table';
import { TierFormDialog } from './tier-form-dialog';
import { DeleteTierDialog } from './delete-tier-dialog';
import type { Tier } from '@/lib/tier-api';

export function TierManagementSection() {
  const { data: tiers, isPending, isError } = useTiers();
  const [formTier, setFormTier] = useState<Tier | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Tier | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mukta text-lg font-semibold text-neutral-800">
            Consultation Commission by Tier
          </h2>
          <p className="mt-0.5 font-mukta text-sm text-neutral-500">
            Tier rates override the global consultation commission for astrologers holding that
            tier. Astrologers without a tier use the global rate above.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setFormTier(null)}
          className="font-mukta text-white"
          style={{ backgroundColor: '#611508' }}
        >
          Add Tier
        </Button>
      </div>

      {isPending && (
        <div className="max-w-5xl space-y-2">
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      )}

      {!isPending && isError && (
        <p className="font-mukta text-sm text-red-600">Failed to load tiers. Please try again.</p>
      )}

      {!isPending && !isError && tiers && tiers.length === 0 && (
        <p className="font-mukta text-sm text-neutral-400">
          No tiers yet. Add one to override the global consultation commission for astrologers.
        </p>
      )}

      {!isPending && !isError && tiers && tiers.length > 0 && (
        <div className="max-w-5xl rounded-2xl border border-neutral-100 shadow-sm">
          <TiersTable tiers={tiers} onEdit={setFormTier} onDelete={setDeleteTarget} />
        </div>
      )}

      <TierFormDialog
        open={formTier !== undefined}
        onOpenChange={open => {
          if (!open) setFormTier(undefined);
        }}
        tier={formTier}
      />

      <DeleteTierDialog
        open={!!deleteTarget}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null);
        }}
        tier={deleteTarget}
      />
    </div>
  );
}
