'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2, X } from 'lucide-react';

import { useBackendClient } from '@/hooks/use-backend-client';
import { type Gift, giftPriceLabel, isGiftFree } from '@/lib/astrologers/gifts';
import { BackendError } from '@/lib/backend/client';

/**
 * The app's GiftSendSheet: the chosen gift, then "Send Gift" (free gifts go straight away) or "Proceed to Pay".
 * Paying needs the web payment flow (eSewa / Fonepay / card, doc 06); until then paid gifts can only be looked at.
 * Built once for the profile and the live viewer (doc 10).
 */
export function GiftSendSheet({
  gift,
  astrologerId,
  astrologerName,
  countryCode,
  onClose,
}: {
  gift: Gift | null;
  astrologerId: string;
  astrologerName: string;
  countryCode: string | null;
  onClose: () => void;
}) {
  const backend = useBackendClient();
  const [sent, setSent] = useState<string | null>(null);
  const free = gift ? isGiftFree(gift) : false;

  const send = useMutation({
    mutationFn: (g: Gift) =>
      backend.post('/gifts/payments/free/send', {
        giftId: g._id,
        astrologerId,
        // The backend checks the price for the same country it was shown for.
        ...(countryCode ? { countryCode } : {}),
      }),
    onSuccess: (_, g) => setSent(g.title),
  });

  const close = () => {
    if (send.isPending) return;
    setSent(null);
    send.reset();
    onClose();
  };

  return (
    <DialogPrimitive.Root open={gift !== null} onOpenChange={open => !open && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/45" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[81] rounded-t-[24px] bg-[#f8f0dc] px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] font-app shadow-xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="text-[18px] font-semibold text-primary">
              Send a Gift
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              disabled={send.isPending}
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {gift && sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
              <CheckCircle2 className="h-12 w-12 text-green-700" aria-hidden />
              <p className="text-[17px] font-semibold text-[#4a1a1a]">Gift sent!</p>
              <p className="text-[15px] text-[#4a4a4a]">
                {sent} sent to {astrologerName}.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-2 h-[48px] w-full rounded-full bg-primary text-[16px] text-white"
              >
                Done
              </button>
            </div>
          ) : gift ? (
            <>
              <div className="mt-5 flex items-center gap-4">
                <GiftImage gift={gift} size={72} />
                <div className="min-w-0">
                  <p className="truncate text-[18px] font-semibold text-[#4a1a1a]">{gift.title}</p>
                  <p className="text-[15px] font-medium text-[#6d6d6d]">{giftPriceLabel(gift)}</p>
                </div>
              </div>

              {send.isError ? (
                <p role="alert" className="mt-4 text-center text-[15px] text-red-700">
                  {send.error instanceof BackendError && send.error.status < 500
                    ? send.error.message
                    : 'Failed to send gift. Please try again.'}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!free || send.isPending}
                onClick={() => send.mutate(gift)}
                className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[17px] text-white disabled:opacity-60"
              >
                {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
                {free ? 'Send Gift' : 'Proceed to Pay'}
              </button>
              {!free ? (
                <p className="mt-2 text-center text-[14px] text-[#6d6d6d]">
                  Paying for gifts on the website opens soon.
                </p>
              ) : null}
            </>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** The app's gift picture in a maroon ring, or the first letter when there's no image. */
export function GiftImage({ gift, size }: { gift: Gift; size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border-2 border-[#720A0B] p-1"
      style={{ width: size, height: size }}
    >
      {gift.image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
        <img src={gift.image.url} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-[#9c2a1f] text-xl font-bold text-[#f8f0dc]">
          {gift.title.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
