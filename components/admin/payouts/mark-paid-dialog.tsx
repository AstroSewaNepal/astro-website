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
import { Input } from '@/components/ui/input';
import { useMarkAllEarningsPaid } from '@/hooks/use-payouts';
import { formatEarningAmount } from '@/lib/format-earning-amount';
import type { UnpaidEarningsRow } from '@/lib/payouts-api';

type MarkPaidDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: UnpaidEarningsRow;
};

export function MarkPaidDialog({ open, onOpenChange, row }: MarkPaidDialogProps) {
  const [payoutReference, setPayoutReference] = useState('');
  const markPaidMutation = useMarkAllEarningsPaid();

  function handleConfirm() {
    markPaidMutation.mutate(
      { astrologerId: row.astrologerId, payoutReference: payoutReference.trim() },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) setPayoutReference('');
        markPaidMutation.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md font-mukta">
        <DialogHeader>
          <DialogTitle className="font-mukta text-base">Mark Earnings as Paid</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="font-mukta text-sm text-neutral-600">
            This marks all <span className="font-semibold">{row.count}</span> unpaid earnings of{' '}
            <span className="font-semibold">{row.fullName ?? row.email ?? 'this astrologer'}</span>{' '}
            (net payable <span className="font-semibold">{formatEarningAmount(row.totalNet)}</span>
            ) as paid out — including earnings still awaiting consultation completion. This cannot
            be undone.
          </p>
          <div className="space-y-2">
            <label className="font-mukta text-sm text-neutral-700">
              Payout reference <span className="text-red-500">*</span>
            </label>
            <Input
              value={payoutReference}
              onChange={e => setPayoutReference(e.target.value)}
              maxLength={200}
              placeholder="e.g. bank transfer ID"
              className="font-mukta"
            />
          </div>
          {markPaidMutation.error && (
            <p className="font-mukta text-sm text-red-600">{markPaidMutation.error.message}</p>
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
            disabled={!payoutReference.trim() || markPaidMutation.isPending}
            onClick={handleConfirm}
            className="bg-red-700 font-mukta text-white hover:bg-red-800"
          >
            {markPaidMutation.isPending ? 'Marking…' : 'Mark as Paid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
