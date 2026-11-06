// My Consultations (client), as the app's MyConsultationsScreen + SuccessCard (ap src/screens/MyConsultations).

import type { Price } from '@/lib/booking/packages';
import { shortDate, type UserSubscription } from '@/lib/booking/subscriptions';

/** GET /connection-schedule-search/:userId items (the parts the list uses). */
export type Consultation = {
  _id: string;
  astrologerId: string;
  astrologer?: {
    _id?: string;
    fullName?: string | null;
    profilePicture?: { url?: string | null; thumbnail?: { url?: string | null } | null } | null;
    isPendingDeletion?: boolean;
  } | null;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: string;
  package?: {
    _id?: string;
    packageType?: string;
    consultationMinutes?: number;
    discountedPrice?: Price | null;
    /** The search endpoint's name for the discounted price. */
    discountedValue?: Price | null;
    cost?: Price | null;
  } | null;
  subscriptionId?: string | null;
  chatId?: string | null;
  reviewId?: string | null;
};

export type ConsultationTab = 'upcoming' | 'completed' | 'subscription';

export const CONSULTATION_TABS: { id: ConsultationTab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'subscription', label: 'Subscription' },
];

export function consultationTab(value: string | string[] | undefined | null): ConsultationTab {
  return value === 'completed' || value === 'subscription' ? value : 'upcoming';
}

export function consultationsPath(tab: ConsultationTab = 'upcoming'): string {
  return `/client/consultations${tab === 'upcoming' ? '' : `?tab=${tab}`}`;
}

/** Plans shown on a tab: active ones on Subscription, used-up ones above the Completed sessions (the app). */
export function planFilter(tab: ConsultationTab): 'Upcoming' | 'Completed' | null {
  if (tab === 'subscription') return 'Upcoming';
  if (tab === 'completed') return 'Completed';
  return null;
}

export type SortOption =
  | 'start_time_asc'
  | 'start_time_desc'
  | 'alphabetical_asc'
  | 'alphabetical_desc'
  | 'duration_high_low'
  | 'duration_low_high';

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'start_time_asc', label: 'Start Time: Earliest First' },
  { id: 'start_time_desc', label: 'Start Time: Latest First' },
  { id: 'alphabetical_asc', label: 'Alphabetical: A - Z' },
  { id: 'alphabetical_desc', label: 'Alphabetical: Z - A' },
  { id: 'duration_high_low', label: 'Duration: High to Low' },
  { id: 'duration_low_high', label: 'Duration: Low to High' },
];

/** Completed lists latest first; the others soonest first. */
export function defaultSort(tab: ConsultationTab): SortOption {
  return tab === 'completed' ? 'start_time_desc' : 'start_time_asc';
}

const SORT_PARAMS: Record<SortOption, [string, 'ASC' | 'DESC']> = {
  start_time_asc: ['scheduledStartAt', 'ASC'],
  start_time_desc: ['scheduledStartAt', 'DESC'],
  alphabetical_asc: ['participantName', 'ASC'],
  alphabetical_desc: ['participantName', 'DESC'],
  duration_low_high: ['consultationDuration', 'ASC'],
  duration_high_low: ['consultationDuration', 'DESC'],
};

export const PAGE_LIMIT = 15;

export type ListQuery = {
  tab: 'upcoming' | 'completed';
  page: number;
  search: string;
  sort: SortOption;
  /** yyyy-MM-dd, optional (the sort sheet's date range). */
  from?: string;
  to?: string;
};

export function searchPath(userId: string, q: ListQuery): string {
  const [sortBy, sortOrder] = SORT_PARAMS[q.sort];
  const params = new URLSearchParams({
    page: String(q.page),
    limit: String(PAGE_LIMIT),
    status: q.tab === 'completed' ? 'Completed' : 'Upcoming',
    sortBy,
    sortOrder,
  });
  if (q.search.trim()) params.set('search', q.search.trim());
  if (q.from) params.set('startDate', q.from);
  if (q.to) params.set('endDate', q.to);
  return `/connection-schedule-search/${encodeURIComponent(userId)}?${params}`;
}

/** "30 minutes", "1 hour", "1h 30min" (the app's formatMinutes). */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hour` : `${h}h ${m}min`;
}

/** "13:30" in the browser's zone. */
export function clockTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** The card's lines: length, day and time (a plan's session shows day and time on one line, as the app). */
export function consultationLines(
  c: Consultation,
): { icon: 'video' | 'date' | 'time'; text: string }[] {
  const length = `${formatMinutes(c.package?.consultationMinutes ?? 0)} consultation`;
  const day = shortDate(c.scheduledStartAt);
  const time = `${clockTime(c.scheduledStartAt)}-${clockTime(c.scheduledEndAt)}`;
  if (c.subscriptionId) {
    return [
      { icon: 'video', text: length },
      { icon: 'date', text: `${day}, ${time.replace('-', ' - ')}` },
    ];
  }
  return [
    { icon: 'video', text: length },
    { icon: 'date', text: day },
    { icon: 'time', text: time },
  ];
}

/** Top-right chip: "Included in Plan", "NPR 850 / paid" or "Free". */
export function priceChip(pkg: Consultation['package']): string {
  if (!pkg) return '';
  if (pkg.packageType === 'Subscription') return 'Included in Plan';
  const price = pkg.discountedPrice ?? pkg.discountedValue;
  if (!price) return '';
  if (price.value === 0) return 'Free';
  return `${price.currency} ${Math.round(price.value)} / paid`;
}

/** The app hides who it was once the astrologer's account is being deleted. */
export function astrologerShown(c: Consultation): {
  name: string;
  photo: string | null;
  gone: boolean;
} {
  if (c.astrologer?.isPendingDeletion)
    return { name: 'Astro Sewa Astrologer', photo: null, gone: true };
  return {
    name: c.astrologer?.fullName?.trim() || 'Astrologer',
    photo:
      c.astrologer?.profilePicture?.thumbnail?.url || c.astrologer?.profilePicture?.url || null,
    gone: false,
  };
}

/**
 * "Consultation N" of each plan session: upcoming ones continue after the plan's used sessions; completed ones are
 * counted among the completed shown (the app's consultationOrdinalById).
 */
export function sessionNumbers(
  items: Consultation[],
  tab: 'upcoming' | 'completed',
  plans: Map<string, Pick<UserSubscription, 'usedConsultations'>>,
): Map<string, number> {
  const bySub = new Map<string, Consultation[]>();
  for (const c of items) {
    if (!c.subscriptionId) continue;
    bySub.set(c.subscriptionId, [...(bySub.get(c.subscriptionId) ?? []), c]);
  }
  const out = new Map<string, number>();
  bySub.forEach((list, subId) => {
    const offset = tab === 'completed' ? 0 : (plans.get(subId)?.usedConsultations ?? 0);
    [...list]
      .sort(
        (a, b) => new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime(),
      )
      .forEach((c, i) => out.set(c._id, offset + i + 1));
  });
  return out;
}

/** Rescheduling is blocked while the session is running (the app's isWithinScheduledTime). */
export function isInProgress(
  c: Pick<Consultation, 'scheduledStartAt' | 'scheduledEndAt'>,
  now: Date,
): boolean {
  return now >= new Date(c.scheduledStartAt) && now <= new Date(c.scheduledEndAt);
}
