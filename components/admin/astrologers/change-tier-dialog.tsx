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
import { useTierTags, useUpdateAstrologerTier } from '@/hooks/use-tier-tags';
import { formatTierName } from '@/lib/tier-tag-utils';

type ChangeTierDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  astrologerUserId: string;
  astrologerName: string;
  currentTierTagId?: string;
};

export function ChangeTierDialog({
  open,
  onOpenChange,
  astrologerUserId,
  astrologerName,
  currentTierTagId,
}: ChangeTierDialogProps) {
  const [tierTagId, setTierTagId] = useState(currentTierTagId ?? '');
  const { data: tierTags, isPending: tierTagsPending } = useTierTags();
  const updateMutation = useUpdateAstrologerTier();

  function handleConfirm() {
    updateMutation.mutate(
      { astrologerId: astrologerUserId, tierTagId },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) setTierTagId(currentTierTagId ?? '');
        updateMutation.reset();
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
          <Select value={tierTagId} onValueChange={setTierTagId}>
            <SelectTrigger className="font-mukta">
              <SelectValue placeholder={tierTagsPending ? 'Loading tiers…' : 'Select a tier'} />
            </SelectTrigger>
            <SelectContent className="font-mukta">
              {tierTags?.map(tag => (
                <SelectItem key={tag._id} value={tag._id}>
                  {formatTierName(tag.name)}
                  {typeof tag.commissionPercentage === 'number'
                    ? ` — ${tag.commissionPercentage}% commission`
                    : ' — global rate'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {updateMutation.error && (
            <p className="font-mukta text-sm text-red-600">{updateMutation.error.message}</p>
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
            disabled={!tierTagId || tierTagId === currentTierTagId || updateMutation.isPending}
            onClick={handleConfirm}
            className="font-mukta text-white"
            style={{ backgroundColor: '#611508' }}
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
