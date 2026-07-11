'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateGift, useDeleteMedia, useUpdateGift, useUploadMedia } from '@/hooks/use-gifts';
import type { Gift } from '@/lib/gifts-api';
import GiftForm, { type GiftFormValues } from './gift-form';

interface CreateEditDialogProps {
  open: boolean;
  onClose: () => void;
  gift?: Gift;
}

export default function CreateEditDialog({ open, onClose, gift }: CreateEditDialogProps) {
  const isEditing = !!gift;
  const createMutation = useCreateGift();
  const updateMutation = useUpdateGift();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  async function handleSubmit(values: GiftFormValues) {
    const input = {
      title: values.title,
      imageId: values.imageId,
      prices: values.prices,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: gift._id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      onClose();
    } catch {
      // error displayed inline via mutationError
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mukta text-neutral-800">
            {isEditing ? 'Edit Gift' : 'Create Gift'}
          </DialogTitle>
        </DialogHeader>

        {mutationError && (
          <p className="text-sm font-mukta text-red-600">{mutationError.message}</p>
        )}

        <GiftForm
          defaultValues={gift}
          onSubmit={handleSubmit}
          onUploadImage={uploadMedia.mutateAsync}
          onDeleteImage={deleteMedia.mutateAsync}
          isSubmitting={isPending}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
