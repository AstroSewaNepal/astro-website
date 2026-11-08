// Paying on the website (doc 06): which backend route starts each purchase, how to read its answer, and how to
// read the server's verdict afterwards. Every purchase here is finished by the server once it is paid (packages
// too, via the packages/initiate routes), so a closed tab or another device never loses what was bought.

export type Gateway = 'esewa' | 'fonepay' | 'card';

/** What is being bought. Times are local `YYYY-MM-DDTHH:mm:00` in `timezone`, as for POST /connection-schedule. */
export type Purchase =
  | {
      kind: 'package';
      packageId: string;
      astrologerId: string;
      scheduledStartAt: string;
      scheduledEndAt: string;
      timezone: string;
    }
  | { kind: 'plan'; planId: string; astrologerId: string }
  | { kind: 'gift'; giftId: string; astrologerId: string };

export type StartRequest = { path: string; body: Record<string, unknown> };

/** A fresh order id per attempt: eSewa refuses one it has seen, and every attempt gets its own payment row. */
export function newOrderId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function startRequest(
  purchase: Purchase,
  gateway: Gateway,
  countryCode: string | null,
): StartRequest {
  // The backend prices it for the same country the buyer was shown.
  const country = countryCode ? { countryCode } : {};
  switch (purchase.kind) {
    case 'package': {
      const { packageId, astrologerId, scheduledStartAt, scheduledEndAt, timezone } = purchase;
      const slot = { packageId, astrologerId, scheduledStartAt, scheduledEndAt, timezone };
      const route =
        gateway === 'card'
          ? '/subscription/payments/hbl/packages/initiate'
          : `/subscription/payments/${gateway}/packages/initiate`;
      return { path: route, body: { ...slot, ...country } };
    }
    case 'plan':
      if (gateway === 'card') {
        return {
          path: '/subscription/payments/hbl/plans/initiate',
          body: { subscriptionPlanId: purchase.planId, ...country },
        };
      }
      return {
        path: `/consultation-subscriptions/payments/${gateway}/initiate`,
        body: {
          subscriptionId: purchase.planId,
          purchaseOrderId: newOrderId('SUB'),
          purchaseOrderName: 'Subscription Plan',
          ...country,
          serverDelivery: true,
        },
      };
    case 'gift':
      if (gateway === 'card') {
        return {
          path: '/subscription/payments/hbl/gifts/initiate',
          body: { giftId: purchase.giftId, astrologerId: purchase.astrologerId, ...country },
        };
      }
      return {
        path: `/gifts/payments/${gateway}/initiate`,
        body: {
          giftId: purchase.giftId,
          astrologerId: purchase.astrologerId,
          ...country,
          serverDelivery: true,
        },
      };
  }
}

/** Where to send the browser (eSewa, card), or the QR to show (Fonepay). */
export type Started =
  | { pidx: string; redirect: string }
  | { pidx: string; qrMessage: string; websocketUrl: string | null };

type Raw = Record<string, unknown>;

/** Some start routes wrap their answer in `{ success, data }`, most don't. */
function unwrap(body: unknown): Raw {
  if (!body || typeof body !== 'object') return {};
  const raw = body as Raw;
  if ('success' in raw && raw.data && typeof raw.data === 'object') return raw.data as Raw;
  return raw;
}

const text = (v: unknown) => (typeof v === 'string' && v ? v : null);

export function readStarted(gateway: Gateway, body: unknown): Started {
  const raw = unwrap(body);
  if (gateway === 'fonepay') {
    const pidx = text(raw.prn);
    const qrMessage = text(raw.qrMessage);
    if (!pidx || !qrMessage) throw new Error('Fonepay did not start. Please try again.');
    return { pidx, qrMessage, websocketUrl: text(raw.websocketId) };
  }
  const pidx = text(raw.pidx);
  // Gifts by eSewa call it payment_url.
  const redirect = text(raw.paymentUrl) ?? text(raw.payment_url);
  if (!pidx || !redirect || !/^https:\/\//i.test(redirect)) {
    throw new Error('The payment page could not be opened. Please try again.');
  }
  return { pidx, redirect };
}

/** The server's verdict on a payment, settling it with the gateway first if needed. */
export function statusPath(gateway: Gateway, pidx: string): string {
  const id = encodeURIComponent(pidx);
  return gateway === 'card'
    ? `/subscription/payments/hbl/status/${id}`
    : `/subscription/payments/${gateway}/purchase/${id}`;
}

export type PaymentState =
  | 'Initiated'
  | 'Pending'
  | 'Completed'
  | 'Refunded'
  | 'Partially Refunded'
  | 'Expired'
  | 'User canceled';

export type FailureReason =
  | 'declined'
  | 'insufficient_funds'
  | 'card_problem'
  | 'security_check'
  | 'cancelled'
  | 'timed_out'
  | 'bank_unavailable'
  | 'unknown';

export type PurchaseStatus = {
  status: PaymentState | string;
  purpose: Purchase['kind'] | 'remedy' | 'live-call' | null;
  fulfilment: {
    status: 'running' | 'done' | 'failed' | 'awaiting-slot';
    resultId: string | null;
    message: string | null;
  } | null;
  failureReason: FailureReason | null;
};

export function readStatus(body: unknown): PurchaseStatus {
  const raw = unwrap(body);
  const f = raw.fulfilment && typeof raw.fulfilment === 'object' ? (raw.fulfilment as Raw) : null;
  return {
    status: text(raw.status) ?? 'Pending',
    purpose: (text(raw.purpose) as PurchaseStatus['purpose']) ?? null,
    fulfilment: f
      ? {
          status: (text(f.status) as NonNullable<PurchaseStatus['fulfilment']>['status']) ?? 'running',
          resultId: text(f.resultId),
          message: text(f.message),
        }
      : null,
    failureReason: (text(raw.failureReason) as FailureReason) ?? null,
  };
}

/**
 * done: paid and delivered · processing: paid, the server is still finishing it · deliveryFailed: paid but it
 * couldn't be delivered (support refunds) · notPaid: cancelled, failed or expired · waiting: not settled yet.
 */
export type Outcome = 'done' | 'processing' | 'deliveryFailed' | 'notPaid' | 'waiting';

const NOT_PAID = new Set(['Expired', 'User canceled', 'Refunded', 'Partially Refunded']);

export function outcomeOf(s: PurchaseStatus): Outcome {
  if (s.status === 'Completed') {
    if (s.fulfilment?.status === 'done') return 'done';
    if (s.fulfilment?.status === 'failed') return 'deliveryFailed';
    return 'processing';
  }
  if (NOT_PAID.has(s.status)) return 'notPaid';
  return 'waiting';
}

/** The app's messages for a card that didn't go through (hbl-failure-message.ts). */
const CARD_MESSAGES: Record<Exclude<FailureReason, 'unknown'>, string> = {
  declined: 'Your bank declined this card. Try another card or contact your bank.',
  insufficient_funds: 'Not enough balance on this card.',
  card_problem: "This card couldn't be used. Check the card details or try another card.",
  security_check:
    'Your bank blocked this payment as a security check. Contact your bank or try another card.',
  cancelled: 'You cancelled the payment. Nothing was charged.',
  timed_out: 'The payment took too long and was cancelled. Please try again.',
  bank_unavailable: 'The card network is busy. Please try again in a few minutes.',
};

export const NOT_PAID_MESSAGE =
  'The payment was cancelled or failed, so nothing was purchased. You can try again.';

export function notPaidMessage(reason: FailureReason | null): string {
  return reason && reason !== 'unknown' ? CARD_MESSAGES[reason] : NOT_PAID_MESSAGE;
}

/** eSewa and Fonepay only take NPR; any other price can only be paid by card. */
export function localGatewaysTake(currency: string | null | undefined): boolean {
  return !currency || currency === 'NPR';
}

/**
 * The payment a gateway sent the browser back with. eSewa names it `transaction_uuid` (bookings, plans) or
 * `pidx` (gifts); cards say `type=hbl`. Fonepay never redirects, our own QR screen links here with `type=fonepay`.
 * Everything in the URL is only a hint: the page asks the server what really happened.
 */
export function returnedPayment(params: URLSearchParams): { pidx: string; gateway: Gateway } | null {
  const pidx = params.get('pidx') || params.get('transaction_uuid');
  if (!pidx || !/^[A-Za-z0-9_-]{4,100}$/.test(pidx)) return null;
  const type = params.get('type');
  const gateway: Gateway = type === 'hbl' ? 'card' : type === 'fonepay' ? 'fonepay' : 'esewa';
  return { pidx, gateway };
}

export type FonepayBank = {
  bankName: string;
  bankCode?: string;
  bankIcon?: string;
  packageName?: string;
  intentScheme: string;
};

/**
 * Opens the buyer's bank app with the Fonepay payload, like the app's openFonepayIssuerApp. Android: an intent
 * link pinned to the bank's package (Fonepay's own sample opens the bank app by package); elsewhere the scheme.
 */
export function bankAppLink(bank: FonepayBank, qrMessage: string, android: boolean): string | null {
  const match = /^([a-z][a-z0-9+.-]*):\/\/(.*)$/i.exec(bank.intentScheme ?? '');
  if (!match) return null;
  const [, scheme, rest] = match;
  const query = `qrPayload=${encodeURIComponent(qrMessage)}`;
  if (android && bank.packageName && /^[A-Za-z0-9_.]+$/.test(bank.packageName)) {
    return `intent://${rest}?${query}#Intent;scheme=${scheme};package=${bank.packageName};end`;
  }
  return `${bank.intentScheme}?${query}`;
}
