'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Loader2, X } from 'lucide-react';

import { GiftImage } from '@/components/astrologers/gift-send-sheet';
import { CheckoutSheet } from '@/components/payments/checkout-sheet';
import { useBackendClient } from '@/hooks/use-backend-client';
import { availableGifts, type Gift, giftPriceLabel, isGiftFree } from '@/lib/astrologers/gifts';
import { BackendError } from '@/lib/backend/client';
import type { LiveCallResult } from '@/lib/live/call-slot';
import { livePath } from '@/lib/live/feed';
import { liveGiftResult } from '@/lib/live/gifts';
import type { LiveSession } from '@/lib/live/session';
import { liveGiftFields, outcomeOf, type Purchase, type PurchaseStatus } from '@/lib/payments/checkout';

export type LiveGiftRoom = {
  roomId: string;
  roomName: string;
  astrologerId: string;
  astrologerName: string;
};

type FreeGiftSent = { giftTitle?: string; sentAt?: string };

/**
 * The app's LiveGiftSheet: the gifts priced for the buyer's country, pick one, then "Send <gift>". Free gifts go
 * straight away; paid ones open the payment options. The server shows every gift in the room (`gift:sent`), so the
 * host, the other viewers and this chat all get it. eSewa and cards leave for the gateway and come back to
 * /payment/return, which links back to the stream; Fonepay and free gifts keep the stream playing.
 */
export function LiveGiftSheet({
  open,
  onOpenChange,
  room,
  session,
  countryCode,
  onResult,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: LiveGiftRoom;
  session: LiveSession;
  countryCode: string | null;
  /** How it went, as the stream's toast. */
  onResult: (result: LiveCallResult) => void;
}) {
  const backend = useBackendClient();
  const [selected, setSelected] = useState<Gift | null>(null);
  const [paying, setPaying] = useState(false);
  // Same cache as the profile's gift row.
  const gifts = useQuery({
    queryKey: ['gifts', countryCode],
    queryFn: () => backend.get<Gift[]>(`/gifts${countryCode ? `?countryCode=${countryCode}` : ''}`),
    staleTime: 10 * 60 * 1000,
    enabled: open,
  });
  const list = availableGifts(Array.isArray(gifts.data) ? gifts.data : []);
  const live = { roomName: room.roomName, roomId: room.roomId };

  const sendFree = useMutation({
    mutationFn: (gift: Gift) =>
      backend.post<FreeGiftSent>('/gifts/payments/free/send', {
        giftId: gift._id,
        astrologerId: room.astrologerId,
        // The backend checks the price for the same country it was shown for.
        ...(countryCode ? { countryCode } : {}),
        ...liveGiftFields(live),
      }),
    onSuccess: (sent, gift) => {
      if (sent?.sentAt) {
        session.showOwnGift({
          giftTitle: sent.giftTitle || gift.title,
          sentAt: sent.sentAt,
          ...(gift.image?.url ? { giftImageUrl: gift.image.url } : {}),
        });
      }
      onResult({ tone: 'good', title: 'Gift sent!', text: `${gift.title} sent to ${room.astrologerName}.` });
      shut();
    },
  });
  const busy = sendFree.isPending;

  // A fresh sheet next time it opens.
  function shut() {
    setSelected(null);
    setPaying(false);
    sendFree.reset();
    onOpenChange(false);
  }
  const close = () => {
    if (!busy) shut();
  };

  const purchase: Purchase | null =
    open && paying && selected
      ? { kind: 'gift', giftId: selected._id, astrologerId: room.astrologerId, live }
      : null;

  if (purchase && selected) {
    return (
      <CheckoutSheet
        purchase={purchase}
        title={selected.title}
        priceLabel={giftPriceLabel(selected)}
        currency={selected.displayCurrency ?? 'NPR'}
        backHref={livePath(room.astrologerId)}
        onBack={() => setPaying(false)}
        onClose={close}
        onFonepaySettled={(_pidx: string, status: PurchaseStatus) => {
          onResult(liveGiftResult(outcomeOf(status), selected.title, room.astrologerName));
          close();
        }}
      />
    );
  }

  const send = () => {
    if (!selected || busy) return;
    if (isGiftFree(selected)) sendFree.mutate(selected);
    else setPaying(true);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={next => (next ? onOpenChange(true) : close())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/45" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[91] flex max-h-[80dvh] flex-col rounded-t-[24px] bg-[#F8F3DF] pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] font-app shadow-xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
        >
          <div className="flex items-center justify-between px-4">
            <span className="w-6" />
            <DialogPrimitive.Title className="font-raleway text-[22px] font-semibold text-primary">Send a Gift</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              disabled={busy}
              className="flex h-6 w-6 items-center justify-center text-primary disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-4">
            {gifts.isPending ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Loading gifts" />
              </div>
            ) : gifts.isError ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-[15px] text-[#4a4a4a]">Gifts could not be loaded.</p>
                <button type="button" onClick={() => void gifts.refetch()} className="text-[15px] font-semibold text-primary">
                  Try again
                </button>
              </div>
            ) : !list.length ? (
              <p className="py-10 text-center text-[15px] text-[#4a4a4a]">No gifts are available right now.</p>
            ) : (
              <ul className="grid grid-cols-4 gap-x-3 gap-y-4 pb-2">
                {list.map(gift => {
                  const on = selected?._id === gift._id;
                  return (
                    <li key={gift._id}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setSelected(gift);
                          sendFree.reset();
                        }}
                        aria-pressed={on}
                        aria-label={`${gift.title}, ${giftPriceLabel(gift)}`}
                        className={clsx(
                          'flex w-full flex-col items-center gap-1 rounded-2xl px-1 pb-2 pt-2 text-center transition-colors',
                          on ? 'bg-[#f1dcc4] ring-2 ring-primary' : 'hover:bg-[#f3e7cf]',
                        )}
                      >
                        <span className={clsx('transition-transform', on && 'scale-110')}>
                          <GiftImage gift={gift} size={58} />
                        </span>
                        <span className="line-clamp-1 w-full text-[13px] font-semibold text-[#4a1a1a]">{gift.title}</span>
                        <span className="text-[12px] text-[#6d6d6d]">{giftPriceLabel(gift)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="px-4 pt-3">
            {sendFree.isError ? (
              <p role="alert" className="mb-2 text-center text-[14px] text-red-700">
                {sendFree.error instanceof BackendError && sendFree.error.status < 500
                  ? sendFree.error.message
                  : 'Failed to send gift. Please try again.'}
              </p>
            ) : null}
            <button
              type="button"
              disabled={!selected || busy}
              onClick={send}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[17px] font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
              {selected ? `Send ${selected.title}` : 'Select a gift'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
