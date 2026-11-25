'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2, UserRound, X } from 'lucide-react';
import clsx from 'clsx';

import { useBackendClient } from '@/hooks/use-backend-client';
import type { AttributionOption } from '@/lib/remedies/cart';

const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

function Avatar({ option }: { option: AttributionOption }) {
  return option.astrologerPhotoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
    <img
      src={option.astrologerPhotoUrl}
      alt=""
      className="h-11 w-11 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1DBD7] text-primary">
      <UserRound className="h-5 w-5" aria-hidden />
    </span>
  );
}

/**
 * "Recommended by an astrologer?" (the app's RemedyAttributionSection): for a platform-owned remedy the buyer may
 * pick one of their consultations, and that astrologer is credited with the sale. Optional.
 */
export function AttributionPicker({
  value,
  onChange,
}: {
  value: AttributionOption | null;
  onChange: (value: AttributionOption | null) => void;
}) {
  const backend = useBackendClient();
  const [open, setOpen] = useState(false);
  const options = useQuery({
    queryKey: ['remedies', 'attribution-options'],
    queryFn: () =>
      backend.get<AttributionOption[]>('/connection-schedule/me/remedy-attribution-options'),
    enabled: open,
    staleTime: 60_000,
  });
  const list = Array.isArray(options.data) ? options.data : [];

  return (
    <>
      <section className="rounded-2xl border border-[#E5E5E5] bg-[#FFFAE6] p-4 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
        <h2 className="font-raleway text-[18px] font-semibold text-[#1C1C1C]">
          Recommended by an astrologer?
        </h2>
        {value ? (
          <div className="mt-3 flex items-center gap-3">
            <Avatar option={value} />
            <p className="min-w-0 flex-1 text-[15px] text-[#1C1C1C]">
              Recommended by <b className="font-semibold">{value.astrologerName}</b>
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[15px] text-primary underline"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove recommendation"
              className="flex h-8 w-8 items-center justify-center text-[#79787A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-2 flex w-full items-center justify-between gap-2 text-left text-[15px] text-[#79787A]"
          >
            Choose the consultation where it was suggested (optional)
            <ChevronRight className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          </button>
        )}
      </section>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/45" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-[91] flex max-h-[80dvh] flex-col rounded-t-[24px] bg-[#F8F3DF] px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] font-app shadow-xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]">
            <div className="flex items-center justify-between">
              <span className="w-6" />
              <DialogPrimitive.Title className="font-raleway text-[20px] font-semibold text-primary">
                Recommended by
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Close"
                className="flex h-6 w-6 items-center justify-center text-primary"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <DialogPrimitive.Description className="mt-1 text-center text-[14px] text-[#79787A]">
              Pick the consultation where an astrologer suggested this remedy.
            </DialogPrimitive.Description>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
              {options.isPending ? (
                <div className="flex justify-center py-10" role="status" aria-label="Loading">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              ) : options.isError ? (
                <p className="py-8 text-center text-[15px] text-[#4a1a1a]">
                  Couldn&apos;t load your consultations. You can still check out without one.
                </p>
              ) : list.length === 0 ? (
                <p className="py-8 text-center text-[15px] text-[#4a1a1a]">
                  You don&apos;t have any eligible consultations yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {list.map(option => (
                    <li key={option.consultationId}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(option);
                          setOpen(false);
                        }}
                        className={clsx(
                          'flex w-full items-center gap-3 rounded-xl border bg-[#FFFAE6] p-3 text-left',
                          value?.consultationId === option.consultationId
                            ? 'border-2 border-primary'
                            : 'border-[#E5E5E5]',
                        )}
                      >
                        <Avatar option={option} />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-[16px] font-semibold text-[#1C1C1C]">
                            {option.astrologerName}
                          </span>
                          <span className="text-[13px] text-[#79787A]">
                            {when(option.scheduledStartAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DialogPrimitive.Close className="mt-4 flex h-[48px] w-full shrink-0 items-center justify-center rounded-full border border-primary text-[16px] text-primary">
              Skip
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
