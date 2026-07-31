'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignTier, useTiers } from '@/hooks/use-tiers';

type ChangeTierDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  astrologerUserId: string;
  astrologerName: string;
  currentTierId?: string;
};

export function ChangeTierDialog({
  open,
  onOpenChange,
  astrologerUserId,
  astrologerName,
  currentTierId,
}: ChangeTierDialogProps) {
  const [tierId, setTierId] = useState(currentTierId ?? '');
  const { data: tiers, isPending: tiersPending } = useTiers();
  const assignMutation = useAssignTier();

  function handleConfirm() {
    assignMutation.mutate(
      { astrologerId: astrologerUserId, tierId },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) setTierId(currentTierId ?? '');
        assignMutation.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md font-mukta">
        <DialogHeader>
          <DialogTitle className="font-mukta text-base">Change Tier</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="font-mukta text-sm text-neutral-600">
            Set the tier for <span className="font-semibold">{astrologerName}</span>. The tier
            determines the consultation commission taken from their earnings.
          </p>
          <Select value={tierId} onValueChange={setTierId}>
            <SelectTrigger className="font-mukta">
              <SelectValue placeholder={tiersPending ? 'Loading tiers…' : 'Select a tier'} />
            </SelectTrigger>
            <SelectContent className="font-mukta">
              {tiers?.map(tier => (
                <SelectItem key={tier._id} value={tier._id}>
                  {tier.name} — {tier.commissionPercentage}% commission
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {assignMutation.error && (
            <p className="font-mukta text-sm text-red-600">{assignMutation.error.message}</p>
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
            disabled={!tierId || tierId === currentTierId || assignMutation.isPending}
            onClick={handleConfirm}
            className="font-mukta text-white"
            style={{ backgroundColor: '#611508' }}
          >
            {assignMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
