'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ConfirmDialog } from '@/components/account/confirm-dialog';
import { useBackendClient } from '@/hooks/use-backend-client';
import { BLOCKS_KEY, blockConfirmText } from '@/lib/moderation';

/** The app's block confirmation (useModerationActions.confirmBlock): POST /blocks/:userId, then `onBlocked`. */
export function BlockDialog({
  user,
  open,
  onOpenChange,
  onBlocked,
}: {
  user: { id: string; name?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlocked?: () => void;
}) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const block = useMutation({
    mutationFn: () => backend.post(`/blocks/${encodeURIComponent(user.id)}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BLOCKS_KEY });
      onOpenChange(false);
      onBlocked?.();
    },
  });
  const { title, message } = blockConfirmText(user.name);
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={next => {
        if (!next) block.reset();
        onOpenChange(next);
      }}
      title={title}
      message={message}
      confirmText="Block"
      cancelText="Cancel"
      busy={block.isPending}
      error={block.isError ? `Could not block this user. ${block.error.message}` : null}
      onConfirm={() => block.mutate()}
    />
  );
}
