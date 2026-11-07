'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Loader2, X } from 'lucide-react';

import {
  RESCHEDULE_REASONS,
  rescheduleReason,
  type RescheduleReasonKey,
} from '@/lib/booking/reschedule';

/** The app's RescheduleReasonModal: pick a reason ("Other" asks for text), then confirm the new time. */
export function RescheduleReasonDialog({
  open,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [key, setKey] = useState<RescheduleReasonKey | null>(null);
  const [other, setOther] = useState('');
  const reason = rescheduleReason(key, other);

  const close = () => {
    if (busy) return;
    // Each opening starts empty, like the app.
    setKey(null);
    setOther('');
    onClose();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={next => (next ? undefined : close())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/40 data-[state=open]:animate-[drawer-fade-in_200ms_ease-out] motion-reduce:animate-none" />
        <DialogPrimitive.Content
          aria-describedby="reschedule-reason-subtitle"
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
            Reschedule Reason
          </DialogPrimitive.Title>
          <p
            id="reschedule-reason-subtitle"
            className="mb-4 mt-1 text-center font-app text-[15px] font-medium text-[#6d6d6d]"
          >
            Please let us know why you&apos;re rescheduling
          </p>

          <fieldset className="flex max-h-[300px] flex-col gap-3 overflow-y-auto" disabled={busy}>
            <legend className="sr-only">Reason</legend>
            {RESCHEDULE_REASONS.map(r => (
              <label key={r.key} className="flex cursor-pointer items-center gap-3 py-0.5">
                <input
                  type="radio"
                  name="reschedule-reason"
                  value={r.key}
                  checked={key === r.key}
                  onChange={() => setKey(r.key)}
                  className="h-5 w-5 accent-[#611508]"
                />
                <span
                  className={`font-app text-[16px] text-primary ${key === r.key ? 'font-bold' : 'font-medium'}`}
                >
                  {r.label}
                </span>
              </label>
            ))}
            {key === 'other' ? (
              <textarea
                value={other}
                onChange={e => setOther(e.target.value)}
                placeholder="Please specify your reason"
                rows={3}
                maxLength={500}
                autoFocus
                className="mt-1 w-full resize-none rounded-xl border-[1.5px] border-[#BE7B71] bg-white px-3 py-2 font-app text-[16px] text-[#1C1C1C] outline-none placeholder:text-[#BE7B71] focus:border-primary"
              />
            ) : null}
          </fieldset>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              disabled={!reason || busy}
              onClick={() => onConfirm(reason)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[32px] bg-primary font-app text-[16px] text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
              Confirm Reschedule
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={close}
              className="h-11 w-full rounded-[32px] border border-primary font-app text-[16px] text-primary disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
