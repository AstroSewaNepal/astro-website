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
import { useDeleteRemediesCategory } from '@/hooks/use-remedies-category';
import type { RemediesCategory } from '@/lib/remedies-category-api';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  category: RemediesCategory | null;
}

export default function DeleteDialog({ open, onClose, category }: DeleteDialogProps) {
  const deleteMutation = useDeleteRemediesCategory();

  async function handleDelete() {
    if (!category) return;
    try {
      await deleteMutation.mutateAsync(category._id);
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
          <DialogTitle className="font-mukta text-neutral-800">Delete Category</DialogTitle>
          <DialogDescription className="font-mukta">
            Are you sure you want to delete <strong>{category?.title}</strong>? This will also
            permanently delete the associated image. This action cannot be undone.
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
