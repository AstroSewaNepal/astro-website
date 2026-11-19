'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

import { useBackendClient } from '@/hooks/use-backend-client';
import { BackendError } from '@/lib/backend/client';
import { planSchedulePath } from '@/lib/booking/packages';
import { livePath } from '@/lib/live/feed';
import {
  type Gateway,
  type Outcome,
  type PurchaseStatus,
  notPaidMessage,
  outcomeOf,
  readStatus,
  returnedPayment,
  statusPath,
} from '@/lib/payments/checkout';
import { type PendingPayment, markPayment, recallPayment } from '@/lib/payments/pending';
import {
  WAITING_PACKAGES_PATH,
  type WaitingPackage,
  rebookByLabel,
  rebookPath,
} from '@/lib/payments/rebook';

const POLL_MS = 3000;
/** How long the page keeps asking before it says "not confirmed yet" (the server's sweepers carry on). */
const GIVE_UP_MS = 2 * 60 * 1000;

const GATEWAY_LABEL: Record<Gateway, string> = { esewa: 'eSewa', fonepay: 'Fonepay', card: 'card' };

const noSubscribe = () => () => {};

/** This browser's note about the payment (what it was, where to try again); read after hydration. */
function usePending(pidx: string | null): PendingPayment | null {
  const raw = useSyncExternalStore(
    noSubscribe,
    () => {
      if (!pidx) return '';
      const p = recallPayment(pidx);
      return p ? JSON.stringify(p) : '';
    },
    () => '',
  );
  return useMemo(() => (raw ? (JSON.parse(raw) as PendingPayment) : null), [raw]);
}

/**
 * Where eSewa and card payments come back to (backend PaymentReturnService), and where the Fonepay QR goes once
 * settled. The URL only says which payment it was: the server's purchase check settles it with the gateway, says
 * what was delivered, and is asked until there is an answer.
 */
export function PaymentReturn({ query }: { query: string }) {
  const backend = useBackendClient();
  const queryClient = useQueryClient();
  const params = useMemo(() => new URLSearchParams(query), [query]);
  const payment = useMemo(() => returnedPayment(params), [params]);
  const pending = usePending(payment?.pidx ?? null);
  // Live calls come back with the stream's astrologer (backend liveReturnTarget), even without this browser's note.
  const liveAstrologerId = /^[A-Za-z0-9_-]{1,64}$/.test(params.get('astrologerId') ?? '')
    ? params.get('astrologerId')
    : null;
  // Gifts and live calls bought inside a stream come back with screen=live-viewer (backend PaymentReturnService).
  const fromStream = params.get('screen') === 'live-viewer';
  // Stops asking after a while (the server's sweepers carry on); "Check Again" starts a new round.
  const [round, setRound] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setGaveUp(true), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, [round]);

  const status = useQuery({
    queryKey: ['payments', 'return', payment?.gateway, payment?.pidx],
    queryFn: async () => {
      const s = readStatus(await backend.bare.get(statusPath(payment!.gateway, payment!.pidx)));
      const outcome = outcomeOf(s);
      // What was bought shows up in these lists now.
      if (outcome === 'done')
        void queryClient.invalidateQueries({ queryKey: ['consultations'] });
      // A paid live call not seated yet (queue full, or still being added): its stream's page says so instead of
      // offering to pay again.
      if (s.purpose === 'live-call' && outcome !== 'waiting')
        markPayment(payment!.pidx, {
          awaitingSlot: outcome === 'awaitingSlot' || outcome === 'processing',
        });
      return s;
    },
    enabled: !!payment,
    retry: (count, error) => !(error instanceof BackendError && error.status < 500) && count < 3,
    refetchInterval: q => {
      const data = q.state.data;
      const open = !data || ['waiting', 'processing'].includes(outcomeOf(data));
      return open && !gaveUp ? POLL_MS : false;
    },
  });

  if (!payment || (status.error instanceof BackendError && status.error.status === 404)) {
    return (
      <Result
        icon="bad"
        title="Payment not found"
        text="We couldn't find this payment. If money was deducted, check My Payments."
        actions={[{ href: '/client/payments', label: 'My Payments' }]}
      />
    );
  }
  if (status.isPending) {
    return <Result icon="wait" title="Verifying payment..." text="This takes a few seconds." />;
  }
  if (status.isError) {
    return (
      <Result
        icon="bad"
        title="We couldn't check this payment"
        text="Please check your connection and try again."
        actions={[{ onClick: () => void status.refetch(), label: 'Try Again' }]}
      />
    );
  }

  const outcome = outcomeOf(status.data);
  const stillAsking = status.isFetching || !gaveUp;
  return (
    <Verdict
      outcome={outcome === 'waiting' && stillAsking ? 'verifying' : outcome}
      status={status.data}
      gateway={payment.gateway}
      pidx={payment.pidx}
      pending={pending}
      liveAstrologerId={liveAstrologerId}
      fromStream={fromStream}
      onCheckAgain={() => {
        setGaveUp(false);
        setRound(r => r + 1);
        void status.refetch();
      }}
    />
  );
}

function Verdict({
  outcome,
  status,
  gateway,
  pidx,
  pending,
  liveAstrologerId,
  fromStream,
  onCheckAgain,
}: {
  outcome: Outcome | 'verifying';
  status: PurchaseStatus;
  gateway: Gateway;
  pidx: string;
  pending: PendingPayment | null;
  liveAstrologerId: string | null;
  fromStream: boolean;
  onCheckAgain: () => void;
}) {
  const kind = status.purpose ?? pending?.kind ?? null;
  const via = GATEWAY_LABEL[gateway];
  const astrologerId = pending?.astrologerId ?? liveAstrologerId ?? null;
  // Bought inside a live stream (a call, or a gift sent from it): the way back is the stream.
  const inStream = kind === 'live-call' || (kind === 'gift' && (fromStream || !!pending?.roomId));
  const tryAgain =
    pending?.backHref ??
    (inStream && astrologerId
      ? livePath(astrologerId)
      : astrologerId
        ? `/astrologer-profile/${astrologerId}`
        : '/astrologers');
  const reason = status.fulfilment?.message
    ? `${status.fulfilment.message.replace(/\.?$/, '.')}`
    : '';
  // A live call: always a way back to the stream it was bought in.
  const backToStream = astrologerId
    ? { href: livePath(astrologerId), label: 'Back to the live stream' }
    : { href: '/live', label: 'Live Astrologers' };

  switch (outcome) {
    case 'verifying':
      return <Result icon="wait" title="Verifying payment..." text="This takes a few seconds." />;
    case 'processing':
      return (
        <Result
          icon="wait"
          title="Payment received"
          text={
            kind === 'live-call'
              ? `Your ${via} payment went through. We're adding you to the queue.`
              : `Your ${via} payment went through. We're finishing your purchase; it will show up in a moment.`
          }
          actions={inStream ? [backToStream] : []}
        />
      );
    case 'awaitingSlot':
      // Only live calls wait for a spot. The server seats the buyer once one frees (or refunds if the stream ends).
      return (
        <Result
          icon="wait-stopped"
          title="Payment confirmed — queue is full"
          text={`Your ${via} payment went through. You'll be added to the queue automatically as soon as a spot opens. If the stream ends first, we'll email you about your refund.`}
          actions={[backToStream]}
        />
      );
    case 'done': {
      const resultId = status.fulfilment?.resultId ?? null;
      if (kind === 'live-call') {
        const position = Number(status.fulfilment?.reference);
        return (
          <Result
            icon="good"
            title="You're in the queue"
            text={`Your ${via} payment went through${
              Number.isFinite(position) && position > 0 ? ` and you are #${position} in line` : ''
            }. Stay on the stream: you'll get a Join prompt when it's your turn.`}
            actions={[backToStream]}
          />
        );
      }
      if (kind === 'package') {
        return (
          <Result
            icon="good"
            title="Appointment booked"
            text={`Your ${via} payment went through and your appointment is booked.`}
            actions={[{ href: '/client/consultations', label: 'My Consultations' }]}
          />
        );
      }
      if (kind === 'plan') {
        return (
          <Result
            icon="good"
            title="Plan activated"
            text={`Your ${via} payment went through and your ${pending?.title ?? 'subscription'} plan is active.`}
            actions={
              astrologerId && resultId
                ? [
                    { href: planSchedulePath(astrologerId, resultId), label: 'Book a Session' },
                    { href: '/client/consultations', label: 'My Consultations', quiet: true },
                  ]
                : [{ href: '/client/consultations', label: 'My Consultations' }]
            }
          />
        );
      }
      if (kind === 'gift') {
        return (
          <Result
            icon="good"
            title="Gift sent!"
            text={`${pending?.title ?? 'Your gift'} was sent. Thank you for your support.`}
            actions={
              inStream
                ? [backToStream]
                : [
                    {
                      href: astrologerId ? `/astrologer-profile/${astrologerId}` : '/astrologers',
                      label: astrologerId ? 'Back to Profile' : 'Astro Connect',
                    },
                  ]
            }
          />
        );
      }
      return (
        <Result
          icon="good"
          title="Payment successful"
          text={`Your ${via} payment went through.`}
          actions={[{ href: '/client/payments', label: 'My Payments' }]}
        />
      );
    }
    case 'deliveryFailed':
      if (kind === 'package') return <PackageNotBooked pidx={pidx} via={via} reason={reason} />;
      return (
        <Result
          icon="bad"
          title={kind === 'live-call' ? 'Payment received, not added to the queue' : 'Payment received, purchase not completed'}
          text={`Your ${via} payment went through, but ${kind === 'live-call' ? "you couldn't be added to the queue" : "your purchase couldn't be completed"}${reason ? `: ${reason}` : '.'} Please contact support; your payment is safe.`}
          actions={[
            { href: '/client/support', label: 'Customer Support' },
            { href: '/client/payments', label: 'My Payments', quiet: true },
          ]}
        />
      );
    case 'notPaid':
      return (
        <Result
          icon="bad"
          title="Payment not completed"
          text={notPaidMessage(gateway === 'card' ? status.failureReason : null)}
          actions={[{ href: tryAgain, label: 'Try Again' }]}
        />
      );
    case 'waiting':
      return (
        <Result
          icon="wait-stopped"
          title="Payment not confirmed yet"
          text="We couldn't confirm this payment yet. If money was deducted, check My Payments before trying again."
          actions={[
            { onClick: onCheckAgain, label: 'Check Again' },
            { href: '/client/payments', label: 'My Payments', quiet: true },
          ]}
        />
      );
  }
}

/**
 * A paid package whose slot went while the buyer paid: the same payment books another time (backend
 * packages/waiting + rebook), so support only refunds when the buyer asks.
 */
function PackageNotBooked({ pidx, via, reason }: { pidx: string; via: string; reason: string }) {
  const backend = useBackendClient();
  const waiting = useQuery({
    queryKey: ['payments', 'waiting-packages'],
    queryFn: () => backend.bare.get<WaitingPackage[]>(WAITING_PACKAGES_PATH),
  });
  const mine = Array.isArray(waiting.data) ? waiting.data.find(w => w.pidx === pidx) : undefined;
  if (waiting.isPending) {
    return <Result icon="wait" title="Payment received" text="Checking your booking..." />;
  }
  return (
    <Result
      icon="bad"
      title="Payment received, booking not made"
      text={`Your ${via} payment went through, but the booking couldn't be made${reason ? `: ${reason}` : '.'} ${
        mine
          ? `Your payment is safe: choose another time for this session (by ${rebookByLabel(mine)}), or contact support for a refund.`
          : 'Please contact support; your payment is safe.'
      }`}
      actions={
        mine
          ? [
              { href: rebookPath(mine), label: 'Choose Another Time' },
              { href: '/client/support', label: 'Customer Support', quiet: true },
            ]
          : [
              { href: '/client/support', label: 'Customer Support' },
              { href: '/client/payments', label: 'My Payments', quiet: true },
            ]
      }
    />
  );
}

type Action = { label: string; quiet?: boolean } & ({ href: string } | { onClick: () => void });

function Result({
  icon,
  title,
  text,
  actions = [],
}: {
  icon: 'good' | 'bad' | 'wait' | 'wait-stopped';
  title: string;
  text: string;
  actions?: Action[];
}) {
  const button =
    'flex h-[52px] w-full items-center justify-center rounded-full font-app text-[17px]';
  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-3 py-12 text-center"
    >
      {icon === 'good' ? (
        <CheckCircle2 className="h-14 w-14 text-green-700" aria-hidden />
      ) : icon === 'bad' ? (
        <XCircle className="h-14 w-14 text-[#b3261e]" aria-hidden />
      ) : icon === 'wait' ? (
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
      ) : (
        <Clock className="h-12 w-12 text-primary" aria-hidden />
      )}
      <h1 className="font-raleway text-[24px] font-semibold text-primary">{title}</h1>
      <p className="font-app text-[16px] text-[#4a4a4a]">{text}</p>
      <div className="mt-3 flex w-full flex-col gap-2">
        {actions.map(a => {
          const cls = `${button} ${a.quiet ? 'border border-primary text-primary' : 'bg-primary text-white'}`;
          return 'href' in a ? (
            <Link key={a.label} href={a.href} className={cls}>
              {a.label}
            </Link>
          ) : (
            <button key={a.label} type="button" onClick={a.onClick} className={cls}>
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
