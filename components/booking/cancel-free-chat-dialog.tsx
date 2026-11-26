'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Loader2, X } from 'lucide-react';

/**
 * Asks before a free chat is cancelled (a free chat can't be rescheduled; cancelling frees it to book a new
 * time). Same look as the reschedule reason popup.
 */
export function CancelFreeChatDialog({
  open,
  busy,
  when,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  /** "27 Nov 2026, 10:00 AM" */
  when: string;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={next => (next || busy ? undefined : onClose())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/40 data-[state=open]:animate-[drawer-fade-in_200ms_ease-out] motion-reduce:animate-none" />
        <DialogPrimitive.Content
          aria-describedby="cancel-free-chat-text"
          className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-[#FFFAE6] px-5 pb-6 pt-11 shadow-xl outline-none data-[state=open]:animate-[drawer-fade-in_250ms_ease-out] motion-reduce:animate-none"
        >
          <DialogPrimitive.Close
            aria-label="Close"
            disabled={busy}
            className="absolute right-3 top-3 text-primary"
          >
            <X className="h-[22px] w-[22px]" />
          </DialogPrimitive.Close>
          <DialogPrimitive.Title className="text-center font-raleway text-[22px] font-semibold text-primary">
            Cancel free chat?
          </DialogPrimitive.Title>
          <p
            id="cancel-free-chat-text"
            className="mt-2 text-center font-app text-[15px] font-medium text-[#6d6d6d]"
          >
            Your free chat{when ? ` on ${when}` : ''} will be cancelled. You can book a new time for
            it afterwards.
          </p>
          {error ? (
            <p role="alert" className="mt-3 text-center font-app text-[14px] text-[#b3261e]">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[32px] bg-primary font-app text-[16px] text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
              Yes, cancel it
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="h-11 w-full rounded-[32px] border border-primary font-app text-[16px] text-primary disabled:opacity-60"
            >
              Keep it
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
