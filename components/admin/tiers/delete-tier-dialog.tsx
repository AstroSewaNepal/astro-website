'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteTier } from '@/hooks/use-tiers';
import type { Tier } from '@/lib/tier-api';

type DeleteTierDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: Tier | null;
};

export function DeleteTierDialog({ open, onOpenChange, tier }: DeleteTierDialogProps) {
  const deleteMutation = useDeleteTier();

  function handleConfirm() {
    if (!tier) return;
    deleteMutation.mutate(tier._id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) deleteMutation.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md font-mukta">
        <DialogHeader>
          <DialogTitle className="font-mukta text-base">Delete Tier</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="font-mukta text-sm text-neutral-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{tier?.name ?? 'this tier'}</span>? This cannot be
            undone.
          </p>
          {deleteMutation.error && (
            <p className="font-mukta text-sm text-red-600">{deleteMutation.error.message}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-mukta"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={handleConfirm}
            className="font-mukta text-white"
            style={{ backgroundColor: '#611508' }}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
