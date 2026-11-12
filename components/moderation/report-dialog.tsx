'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2, X } from 'lucide-react';

import { useBackendClient } from '@/hooks/use-backend-client';
import {
  REPORT_DESCRIPTION_MAX,
  REPORT_REASONS,
  reportBody,
  reportProblem,
  type ReportReason,
  type ReportTarget,
} from '@/lib/moderation';

/**
 * The app's ReportSheet: why (8 reasons; "Something else" needs details), optional details, then POST /reports.
 * Mount it only while open, so every report starts empty. The site has no toasts, so the thank-you shows in the
 * dialog itself.
 */
export function ReportDialog({
  title,
  target,
  onClose,
}: {
  title: string;
  target: ReportTarget;
  onClose: () => void;
}) {
  const backend = useBackendClient();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const submit = useMutation({
    mutationFn: (r: ReportReason) =>
      backend.post<{ reportId: string }>('/reports', reportBody(target, r, description)),
  });
  const problem = reportProblem(reason, description);
  const needsDetails = reason === 'OTHER' && !description.trim();

  const close = () => {
    if (!submit.isPending) onClose();
  };

  return (
    <DialogPrimitive.Root open onOpenChange={next => (next ? undefined : close())}>
      <DialogPrimitive.Portal>
        {/* Above the full-screen phone chat (z-55), like the review dialog. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/40 data-[state=open]:animate-[drawer-fade-in_200ms_ease-out] motion-reduce:animate-none" />
        <DialogPrimitive.Content
          aria-describedby="report-question"
          className="fixed left-1/2 top-1/2 z-[71] flex max-h-[90dvh] w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[20px] bg-[#FFFAE6] px-5 pb-6 pt-11 font-app shadow-xl outline-none data-[state=open]:animate-[drawer-fade-in_250ms_ease-out] motion-reduce:animate-none"
        >
          <DialogPrimitive.Close
            aria-label="Close"
            disabled={submit.isPending}
            className="absolute right-3 top-3 text-primary"
          >
            <X className="h-[22px] w-[22px]" />
          </DialogPrimitive.Close>
          <DialogPrimitive.Title className="text-center font-raleway text-[22px] font-semibold text-primary">
            {title}
          </DialogPrimitive.Title>

          {submit.isSuccess ? (
            <div role="status" className="flex flex-col items-center gap-3 pt-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#15B763]" aria-hidden />
              <p id="report-question" className="text-[18px] font-semibold text-primary">
                Report submitted
              </p>
              <p className="text-[15px] text-[#4a4a4a]">
                Thanks for letting us know. Our team will review it within 24 hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 h-11 w-full rounded-[32px] bg-primary text-[16px] text-white"
              >
                Done
              </button>
            </div>
          ) : (
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={e => {
                e.preventDefault();
                if (reason && !problem && !submit.isPending) submit.mutate(reason);
              }}
            >
              <p
                id="report-question"
                className="mb-2 mt-1 text-center text-[15px] font-medium text-[#BE7B71]"
              >
                Why are you reporting this?
              </p>
              <fieldset
                className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto"
                disabled={submit.isPending}
              >
                <legend className="sr-only">Reason</legend>
                {REPORT_REASONS.map(r => (
                  <label key={r.value} className="flex cursor-pointer items-center gap-3 py-0.5">
                    <input
                      type="radio"
                      name="report-reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="h-5 w-5 shrink-0 accent-[#611508]"
                    />
                    <span
                      className={`text-[16px] text-primary ${reason === r.value ? 'font-bold' : 'font-medium'}`}
                    >
                      {r.label}
                    </span>
                  </label>
                ))}
                <label className="mt-1">
                  <span className="sr-only">Details</span>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={REPORT_DESCRIPTION_MAX}
                    rows={3}
                    placeholder="Add details (optional)"
                    aria-invalid={needsDetails || undefined}
                    className="w-full resize-none rounded-xl border-[1.5px] border-[#BE7B71] bg-white px-3 py-2 text-[16px] text-[#1C1C1C] outline-none placeholder:text-[#BE7B71] focus:border-primary"
                  />
                </label>
                {needsDetails ? (
                  <p className="-mt-1 text-[13px] text-[#C00303]">Please describe the issue</p>
                ) : null}
              </fieldset>
              <p className="mt-3 text-[13px] leading-snug text-[#6d6d6d]">
                Reports are confidential. Our team reviews every report within 24 hours and removes
                content or accounts that break our Terms of Use.
              </p>
              {submit.isError ? (
                <p
                  role="alert"
                  className="mt-3 rounded-xl bg-[#fdecea] px-3 py-2 text-[14px] text-[#4a1a1a]"
                >
                  <b>Could not submit the report.</b> {submit.error.message}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={!!problem || submit.isPending}
                className="mt-4 flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-[32px] bg-primary text-[16px] text-white disabled:opacity-60"
              >
                {submit.isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
                Submit report
              </button>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
