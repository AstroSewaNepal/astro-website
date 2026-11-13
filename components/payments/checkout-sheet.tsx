'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import clsx from 'clsx';

import { useBackendClient } from '@/hooks/use-backend-client';
import { useBuyerCountry } from '@/hooks/use-buyer-country';
import {
  type Gateway,
  type Purchase,
  localGatewaysTake,
  readStarted,
  startRequest,
} from '@/lib/payments/checkout';
import { noteOutsideTrip } from '@/lib/navigation/outside-trip';
import { rememberPayment } from '@/lib/payments/pending';
import { FonepayPanel } from './fonepay-panel';

/**
 * The app's PaymentOptionsModal: Local Payment (eSewa, Fonepay), Global Payment (card, when the server has cards
 * on), then "Proceed to pay". eSewa and cards leave for the gateway's page in this tab and come back to
 * /payment/return; Fonepay shows its QR here. Pop-ups and iframes are out: browsers block a tab opened after the
 * request, and gateways refuse to be framed.
 */
export function CheckoutSheet({
  purchase,
  title,
  priceLabel,
  currency,
  backHref,
  onClose,
}: {
  /** null = closed */
  purchase: Purchase | null;
  /** What is bought, for the return page: "Rose", "3 Months plan" */
  title: string;
  priceLabel: string;
  currency: string | null;
  /** Where "Try again" goes after a failed payment */
  backHref: string;
  onClose: () => void;
}) {
  const backend = useBackendClient();
  const router = useRouter();
  const { countryCode } = useBuyerCountry();
  const [choice, setChoice] = useState<Gateway | null>(null);
  const [qr, setQr] = useState<{
    pidx: string;
    qrMessage: string;
    websocketUrl: string | null;
  } | null>(null);
  const [leaving, setLeaving] = useState(false);

  const cards = useQuery({
    queryKey: ['payments', 'card-availability'],
    queryFn: () =>
      backend.bare.get<{ enabled?: boolean }>('/subscription/payments/hbl/availability'),
    staleTime: 5 * 60 * 1000,
    enabled: purchase !== null,
  });
  const cardOn = cards.data?.enabled === true;
  const localOk = localGatewaysTake(currency);

  const start = useMutation({
    mutationFn: async (gateway: Gateway) => {
      const { path, body } = startRequest(purchase!, gateway, countryCode);
      return { gateway, started: readStarted(gateway, await backend.bare.post(path, body)) };
    },
    onSuccess: ({ gateway, started }) => {
      rememberPayment({
        pidx: started.pidx,
        gateway,
        kind: purchase!.kind,
        astrologerId: purchase!.astrologerId,
        title,
        backHref,
        startedAt: Date.now(),
      });
      if ('redirect' in started) {
        // Same tab: the gateway sends the browser back to /payment/return, and Back from there skips its pages.
        setLeaving(true);
        noteOutsideTrip('payment');
        window.location.assign(started.redirect);
      } else {
        setQr(started);
      }
    },
  });

  // Back from the gateway can restore this page as it was (back/forward cache): not leaving any more.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLeaving(false);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const busy = start.isPending || leaving;
  const close = () => {
    if (busy) return;
    // A fresh sheet next time it opens.
    setChoice(null);
    setQr(null);
    start.reset();
    onClose();
  };

  return (
    <DialogPrimitive.Root open={purchase !== null} onOpenChange={open => !open && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/45" />
        <DialogPrimitive.Content
          aria-describedby="checkout-price"
          className="fixed inset-x-0 bottom-0 z-[91] flex max-h-[92dvh] flex-col rounded-t-[24px] bg-[#F8F3DF] px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] font-app shadow-xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
        >
          <div className="flex items-center justify-between">
            <span className="w-6" />
            <DialogPrimitive.Title className="font-raleway text-[22px] font-semibold text-primary">
              {qr ? 'Pay with Fonepay' : 'Payment Options'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              disabled={busy}
              className="flex h-6 w-6 items-center justify-center text-primary disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <p id="checkout-price" className="mt-1 text-center text-[15px] text-[#4a4a4a]">
            {title} · <b className="text-primary">{priceLabel}</b>
          </p>

          {qr ? (
            <FonepayPanel
              payment={qr}
              onSettled={() =>
                router.push(`/payment/return?type=fonepay&pidx=${encodeURIComponent(qr.pidx)}`)
              }
            />
          ) : (
            <div className="mt-4 flex min-h-0 flex-col gap-4 overflow-y-auto">
              <section className="flex flex-col gap-2.5">
                <h2 className="font-raleway text-[18px] font-semibold text-primary">
                  Local Payment
                </h2>
                {!localOk ? (
                  <p className="text-[14px] text-[#6d6d6d]">
                    {cardOn
                      ? `eSewa and Fonepay only accept NPR. This price is in ${currency}, so please pay by card.`
                      : `eSewa and Fonepay only accept NPR, and this price is in ${currency}. Payment in ${currency} isn't available yet.`}
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  <Tile
                    selected={choice === 'esewa'}
                    disabled={!localOk || busy}
                    onClick={() => setChoice('esewa')}
                    label="eSewa"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- static logo */}
                    <img src="/images/payments/esewa.webp" alt="" width={32} height={32} />
                  </Tile>
                  <Tile
                    selected={choice === 'fonepay'}
                    disabled={!localOk || busy}
                    onClick={() => setChoice('fonepay')}
                    label="Fonepay"
                  >
                    <span aria-hidden className="text-[18px] font-semibold">
                      <span className="text-[#0a0d12]">fone</span>
                      <span className="text-[#ce2027]">pay</span>
                    </span>
                  </Tile>
                </div>
              </section>

              {cardOn ? (
                <section className="flex flex-col gap-2.5">
                  <h2 className="font-raleway text-[18px] font-semibold text-primary">
                    Global Payment
                  </h2>
                  <button
                    type="button"
                    aria-pressed={choice === 'card'}
                    disabled={busy}
                    onClick={() => setChoice('card')}
                    className={clsx(
                      'flex w-full flex-col gap-2 rounded-lg border px-4 py-3 text-left',
                      choice === 'card' ? 'border-2 border-[#BE7B71]' : 'border-primary',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-raleway text-[16px] font-semibold text-[#1C1C1C]">
                        Credit / Debit Card
                      </span>
                      <span
                        className="flex items-center gap-1.5"
                        aria-label="Visa, Mastercard, Amex, UnionPay"
                      >
                        {/* eslint-disable @next/next/no-img-element -- static logos */}
                        <img src="/images/payments/card-visa.svg" alt="" width={40} height={13} />
                        <img
                          src="/images/payments/card-mastercard.svg"
                          alt=""
                          width={26}
                          height={16}
                        />
                        <img src="/images/payments/card-amex.svg" alt="" width={18} height={18} />
                        <img
                          src="/images/payments/card-unionpay.svg"
                          alt=""
                          width={26}
                          height={16}
                        />
                        {/* eslint-enable @next/next/no-img-element */}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] text-[#6d6d6d]">
                      Secured by
                      {/* eslint-disable-next-line @next/next/no-img-element -- static logo */}
                      <img
                        src="/images/payments/hbl-logo.webp"
                        alt="Himalayan Bank"
                        width={80}
                        height={16}
                        className="h-4 w-auto"
                      />
                    </span>
                  </button>
                </section>
              ) : null}

              {start.isError ? (
                <p
                  role="alert"
                  className="rounded-xl bg-[#fdecea] px-3 py-2 text-[14px] text-[#4a1a1a]"
                >
                  {start.error.message || 'Could not start the payment. Please try again.'}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!choice || busy || (choice !== 'card' && !localOk)}
                onClick={() => choice && start.mutate(choice)}
                className="flex h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-[17px] text-white disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
                {leaving ? 'Opening the payment page...' : 'Proceed to pay'}
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Tile({
  selected,
  disabled,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'flex h-[72px] items-center justify-center gap-2 rounded-lg border',
        selected && !disabled ? 'border-2 border-[#BE7B71]' : 'border-primary',
        disabled && 'opacity-40',
      )}
    >
      {children}
      {label === 'eSewa' ? (
        <span className="font-raleway text-[16px] font-semibold text-[#1C1C1C]">eSewa</span>
      ) : null}
    </button>
  );
}
