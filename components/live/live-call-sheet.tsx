'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { X } from 'lucide-react';

import { CheckoutSheet } from '@/components/payments/checkout-sheet';
import { formatCallSlotPrice, livePath } from '@/lib/live/feed';
import {
  CALL_SLOT_MINUTES,
  CALL_TYPE_OPTIONS,
  callTypeTitle,
  liveCallResult,
  myQueueText,
  type LiveCallResult,
} from '@/lib/live/call-slot';
import type { LiveCallType } from '@/lib/live/messages';
import type { LiveSession, LiveState } from '@/lib/live/session';
import { outcomeOf, type Purchase, type PurchaseStatus } from '@/lib/payments/checkout';
import { markPayment } from '@/lib/payments/pending';

export type LiveCallRoom = {
  roomId: string;
  roomName: string;
  astrologerId: string;
  astrologerName: string;
};

/**
 * The app's CallSlotSheet: pick the call type (price · 10 minutes), then the usual payment options. eSewa and cards
 * leave for the gateway and come back to /payment/return, which links back here; Fonepay pays in page, so the stream
 * keeps playing and the verdict is shown right here. The server seats the buyer in the queue itself once paid.
 * Someone already in the queue sees their place instead (a paid place can't be given up).
 */
export function LiveCallSheet({
  open,
  onOpenChange,
  room,
  session,
  state,
  disabledReason,
  onResult,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: LiveCallRoom;
  session: LiveSession;
  state: LiveState;
  /** Why a call can't be booked now (closed, full, in a consultation...), or null. */
  disabledReason: string | null;
  /** A Fonepay payment settled while on the stream: say how it went. */
  onResult: (result: LiveCallResult) => void;
}) {
  const [callType, setCallType] = useState<LiveCallType | null>(null);
  const [paying, setPaying] = useState(false);

  const price = state.queue?.price ?? null;
  const priceText = price ? formatCallSlotPrice(price) : null;
  const me = state.me;

  const close = () => {
    setCallType(null);
    setPaying(false);
    onOpenChange(false);
  };

  const purchase: Purchase | null =
    open && paying && callType && price
      ? {
          kind: 'live-call',
          astrologerId: room.astrologerId,
          roomId: room.roomId,
          roomName: room.roomName,
          callType,
          amount: price.amount,
        }
      : null;

  const settled = (pidx: string, status: PurchaseStatus) => {
    const outcome = outcomeOf(status);
    // Paid but not seated yet (queue full, or the server is still at it): the page keeps checking, and Call stays
    // off meanwhile so nobody pays twice.
    markPayment(pidx, { awaitingSlot: outcome === 'awaitingSlot' || outcome === 'processing' });
    onResult(liveCallResult(outcome, status, room.astrologerName));
    close();
    // The queue place shows at once instead of on the next poll.
    void session.refreshStatus();
  };

  if (purchase) {
    return (
      <CheckoutSheet
        purchase={purchase}
        title={`${callTypeTitle(purchase.callType)} · ${CALL_SLOT_MINUTES} min`}
        priceLabel={priceText ?? ''}
        currency={price?.currency ?? null}
        backHref={livePath(room.astrologerId)}
        note="You will join the queue after payment. You'll be notified when it's your turn."
        onBack={() => setPaying(false)}
        onClose={close}
        onFonepaySettled={settled}
      />
    );
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={next => (next ? onOpenChange(true) : close())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/45" />
        <DialogPrimitive.Content
          aria-describedby="live-call-sub"
          className="fixed inset-x-0 bottom-0 z-[91] flex max-h-[92dvh] flex-col gap-3 overflow-y-auto rounded-t-[24px] bg-[#F8F3DF] px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] font-app shadow-xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
        >
          <div className="flex items-center justify-between">
            <span className="w-6" />
            <DialogPrimitive.Title className="font-raleway text-[22px] font-semibold text-primary">
              {me ? 'Your live call' : 'Choose your call type'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-6 w-6 items-center justify-center text-primary"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <p id="live-call-sub" className="text-center text-[15px] text-[#4a4a4a]">
            {priceText ?? '…'} · {CALL_SLOT_MINUTES} minutes
          </p>

          {me ? (
            <InQueue line={myQueueText(me)} callType={me.callType} />
          ) : (
            <ChooseType
              disabledReason={disabledReason}
              callType={callType}
              onPick={setCallType}
              canContinue={!!callType && !!price && !disabledReason}
              priceText={priceText}
              onContinue={() => setPaying(true)}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Step one: the three call types (the app's rows) and Continue with the price. */
function ChooseType({
  disabledReason,
  callType,
  onPick,
  canContinue,
  priceText,
  onContinue,
}: {
  disabledReason: string | null;
  callType: LiveCallType | null;
  onPick: (type: LiveCallType) => void;
  canContinue: boolean;
  priceText: string | null;
  onContinue: () => void;
}) {
  return (
    <>
      {disabledReason ? (
        <p role="status" className="text-center text-[14px] leading-5 text-[#6d6d6d]">
          {disabledReason}
        </p>
      ) : null}
      <div className="my-1 flex flex-col gap-2.5" role="radiogroup" aria-label="Call type">
        {CALL_TYPE_OPTIONS.map(option => {
          const selected = callType === option.type;
          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPick(option.type)}
              className={clsx(
                'flex items-center gap-3 rounded-lg bg-white p-3.5 text-left',
                selected ? 'border-2 border-[#BE7B71]' : 'border border-[#e2d6c9]',
              )}
            >
              <span aria-hidden className="text-[24px]">
                {option.emoji}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[16px] font-medium text-primary">{option.title}</span>
                <span className="text-[13px] text-[#6d6d6d]">{option.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className="flex h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-[17px] text-white disabled:opacity-60"
      >
        {priceText ? `Continue  ${priceText}` : 'Continue'}
      </button>
    </>
  );
}

/** Already in the queue: where and which call. */
function InQueue({ line, callType }: { line: string | null; callType: LiveCallType }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-lg border border-[#e2d6c9] bg-white p-3.5">
        <Row label="Status" value={line ?? ''} />
        <Row label="Call type" value={callTypeTitle(callType)} />
        <Row label="Duration" value={`${CALL_SLOT_MINUTES} minutes`} />
      </div>
      <p className="text-[14px] leading-5 text-[#6d6d6d]">
        Stay on this stream: you&apos;ll get a Join prompt when it&apos;s your turn.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] text-[#6d6d6d]">{label}</span>
      <span className="text-right text-[15px] font-medium text-primary">{value}</span>
    </div>
  );
}
