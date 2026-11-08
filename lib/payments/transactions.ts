// My Payments (doc 06): GET /transactions, the app's MyPayments screen (ap src/screens/MyPayments).
// Subscription plan purchases aren't in this history (the backend lists consultations, remedies, gifts and live
// calls only), the same as the app.

export type TransactionKind = 'consultation' | 'remedy' | 'gift' | 'live';
export type TransactionFilter = 'all' | TransactionKind;

export const TRANSACTION_FILTERS: { id: TransactionFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'consultation', label: 'Consultations' },
  { id: 'remedy', label: 'Remedies' },
  { id: 'gift', label: 'Gifts' },
  { id: 'live', label: 'Live Calls' },
];

export type Transaction = {
  id: string;
  type: TransactionKind;
  paymentMethod: 'esewa' | 'khalti' | 'fonepay' | 'hbl' | string;
  createdAt: string;
  consultation?: {
    astrologerId?: string;
    astrologerName?: string;
    packageType?: string | null;
    consultationMinutes?: number | null;
    scheduledStartAt?: string | null;
    status?: string;
    amount: number;
    currency: string;
  };
  gift?: {
    giftTitle?: string;
    astrologerId?: string;
    astrologerName?: string;
    amount: number;
    currency: string;
    sentAt?: string;
  };
  live?: {
    astrologerId?: string;
    astrologerName?: string;
    callType?: string;
    amount: number;
    currency: string;
    paidAt?: string;
  };
  remedy?: {
    trackingNumber?: string;
    status?: string;
    items: { name: string; currency: string; discountedPrice: number; quantity: number }[];
    totalDeliveryCharge?: number;
  };
};

export type TransactionsPage = {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
};

export const TRANSACTIONS_PAGE_LIMIT = 15;

export function transactionsPath(q: {
  page: number;
  type: TransactionFilter;
  search: string;
  from: string;
  to: string;
}): string {
  const params = new URLSearchParams({ page: String(q.page), limit: String(TRANSACTIONS_PAGE_LIMIT) });
  if (q.type !== 'all') params.set('type', q.type);
  if (q.search) params.set('search', q.search);
  if (q.from) params.set('startDate', q.from);
  if (q.to) params.set('endDate', q.to);
  return `/transactions?${params.toString()}`;
}

export function nextTransactionsPage(last: TransactionsPage | null | undefined): number | undefined {
  if (!last) return undefined;
  return last.page * last.limit < last.total ? last.page + 1 : undefined;
}

const METHOD_LABEL: Record<string, string> = {
  esewa: 'eSewa',
  khalti: 'Khalti',
  fonepay: 'Fonepay',
  hbl: 'Card',
};

const KIND_LABEL: Record<TransactionKind, string> = {
  consultation: 'Consultation',
  remedy: 'Remedy',
  gift: 'Gift',
  live: 'Live Call',
};

const LIVE_CALL_LABEL: Record<string, string> = {
  public_video: 'Public Video Call',
  public_audio: 'Public Audio Call',
  private_audio: 'Private Audio Call',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  placed: 'Placed',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

export type TransactionView = {
  kind: TransactionKind;
  kindLabel: string;
  method: string;
  methodLabel: string;
  title: string;
  subtitle: string | null;
  amount: string;
  /** ISO time shown on the card: the session time, when the gift was sent, when it was paid. */
  at: string;
  status: { key: string; label: string } | null;
};

/** One card of the app's TransactionCard, as plain text. Null for a row it can't show. */
export function transactionView(t: Transaction): TransactionView | null {
  const base = {
    kind: t.type,
    kindLabel: KIND_LABEL[t.type] ?? t.type,
    method: t.paymentMethod,
    methodLabel: METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod,
  };
  const status = (key?: string | null) =>
    key ? { key, label: STATUS_LABEL[key] ?? key } : null;

  if (t.type === 'consultation' && t.consultation) {
    const c = t.consultation;
    return {
      ...base,
      title: c.astrologerName || 'Astrologer',
      subtitle: c.packageType
        ? c.consultationMinutes
          ? `${c.packageType} · ${c.consultationMinutes} min`
          : c.packageType
        : null,
      amount: `${c.currency} ${Math.round(c.amount)}`,
      at: c.scheduledStartAt ?? t.createdAt,
      status: status(c.status),
    };
  }
  if (t.type === 'gift' && t.gift) {
    const g = t.gift;
    // Free gifts come back labelled as a Khalti payment of 0 (the backend's fallback method): show them as free.
    const free = g.amount === 0;
    return {
      ...base,
      ...(free ? { method: 'free', methodLabel: 'Free' } : {}),
      title: g.giftTitle || 'Gift',
      subtitle: g.astrologerName ? `To ${g.astrologerName}` : null,
      amount: free ? 'Free' : `${g.currency} ${g.amount.toFixed(2)}`,
      at: g.sentAt ?? t.createdAt,
      status: null,
    };
  }
  if (t.type === 'live' && t.live) {
    const l = t.live;
    return {
      ...base,
      title: l.astrologerName || 'Astrologer',
      subtitle: LIVE_CALL_LABEL[l.callType ?? ''] ?? 'Live Call',
      amount: `${l.currency} ${Math.round(l.amount)}`,
      at: l.paidAt ?? t.createdAt,
      status: null,
    };
  }
  if (t.type === 'remedy' && t.remedy) {
    const r = t.remedy;
    const items = Array.isArray(r.items) ? r.items : [];
    // The app adds the items and the delivery charge itself.
    const total =
      items.reduce((sum, i) => sum + i.discountedPrice * i.quantity, 0) + (r.totalDeliveryCharge ?? 0);
    return {
      ...base,
      title: items.map(i => i.name).join(', ') || 'Remedy order',
      subtitle: r.trackingNumber ? `Order ${r.trackingNumber}` : null,
      amount: `${items[0]?.currency ?? 'NPR'} ${Math.round(total)}`,
      at: t.createdAt,
      status: status(r.status ?? 'placed'),
    };
  }
  return null;
}

/** "08 Nov 2026 · 10:15 AM", in the viewer's time zone. */
export function transactionTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}
