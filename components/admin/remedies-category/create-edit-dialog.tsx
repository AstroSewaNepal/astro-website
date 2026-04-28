'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  useCreateRemediesCategory,
  useDeleteMedia,
  useUpdateRemediesCategory,
  useUploadMedia,
} from '@/hooks/use-remedies-category';
import type { RemediesCategory } from '@/lib/remedies-category-api';
import RemediesCategoryForm, { type RemediesCategoryFormValues } from './remedies-category-form';

interface CreateEditDialogProps {
  open: boolean;
  onClose: () => void;
  category?: RemediesCategory;
}

export default function CreateEditDialog({ open, onClose, category }: CreateEditDialogProps) {
  const isEditing = !!category;
  const createMutation = useCreateRemediesCategory();
  const updateMutation = useUpdateRemediesCategory();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  async function handleSubmit(values: RemediesCategoryFormValues) {
    const input = {
      title: values.title,
      description: values.description,
      imageId: values.imageId,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: category._id, input });
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
            {isEditing ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        {mutationError && (
          <p className="text-sm font-mukta text-red-600">{mutationError.message}</p>
        )}

        <RemediesCategoryForm
          defaultValues={category}
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
