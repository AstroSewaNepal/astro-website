'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Loader2, X } from 'lucide-react';

/** The app's ConfirmationModal in the Figma style (Setting/Frame-4527): title, optional message, two buttons. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'Back',
  busy = false,
  error,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
}) {
  // While the action runs the dialog stays put (no closing halfway through a delete).
  const setOpen = (next: boolean) => {
    if (!busy) onOpenChange(next);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/45" />
        <DialogPrimitive.Content
          {...(message ? {} : { 'aria-describedby': undefined })}
          className="fixed left-1/2 top-1/2 z-[81] w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-[#f8f0dc] px-6 pb-6 pt-9 text-center shadow-xl outline-none"
        >
          <DialogPrimitive.Close
            aria-label="Close"
            disabled={busy}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#720A0B] text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
          <DialogPrimitive.Title className="font-mukta text-[22px] font-semibold leading-snug text-[#720A0B]">
            {title}
          </DialogPrimitive.Title>
          {message ? (
            <DialogPrimitive.Description className="mt-3 font-mukta text-[15px] leading-relaxed text-[#4a1a1a]">
              {message}
            </DialogPrimitive.Description>
          ) : null}
          {error ? (
            <p role="alert" className="mt-3 font-mukta text-[15px] text-red-700">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex justify-center gap-4">
            <DialogPrimitive.Close
              disabled={busy}
              className="h-[44px] min-w-[120px] rounded-full border border-[#BE7B71] px-6 font-mukta text-[17px] text-[#BE7B71] disabled:opacity-50"
            >
              {cancelText}
            </DialogPrimitive.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="flex h-[44px] min-w-[120px] items-center justify-center gap-2 rounded-full bg-[#720A0B] px-6 font-mukta text-[17px] text-white disabled:opacity-70"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {confirmText}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
