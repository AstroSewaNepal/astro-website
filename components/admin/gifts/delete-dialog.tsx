'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteGift } from '@/hooks/use-gifts';
import type { Gift } from '@/lib/gifts-api';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  gift: Gift | null;
}

export default function DeleteDialog({ open, onClose, gift }: DeleteDialogProps) {
  const deleteMutation = useDeleteGift();

  async function handleDelete() {
    if (!gift) return;
    try {
      await deleteMutation.mutateAsync(gift._id);
      onClose();
    } catch {
      // error displayed inline
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mukta text-neutral-800">Delete Gift</DialogTitle>
          <DialogDescription className="font-mukta">
            Are you sure you want to delete <strong>{gift?.title}</strong>? This will also
            permanently delete the associated image. This action cannot be undone. If this gift has
            already been sent by users, deletion will be blocked — deactivate it instead.
          </DialogDescription>
        </DialogHeader>

        {deleteMutation.isError && (
          <p className="text-sm font-mukta text-red-600">{deleteMutation.error.message}</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="font-mukta"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="font-mukta"
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
