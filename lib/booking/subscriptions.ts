// The buyer's subscription plans in My Consultations, as the app (ap src/screens/MyConsultations).

import type { Price } from '@/lib/booking/packages';

export type SubscriptionStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

/** GET /consultation-subscriptions/me and /consultation-subscriptions/:id */
export type UserSubscription = {
  id: string;
  astrologerId: string;
  astrologer?: {
    fullName?: string | null;
    profilePicture?: { url?: string | null; thumbnail?: { url?: string | null } | null } | null;
  } | null;
  plan: { durationMonths: number; consultationMinutes: number; totalConsultations: number };
  totalConsultations: number;
  usedConsultations: number;
  scheduledConsultations: number;
  /** Backend-computed (total - used - scheduled): trusted as is, like the app. */
  availableToSchedule: number;
  startAt: string;
  endAt: string;
  status: SubscriptionStatus;
  amountPaid?: Price | null;
  createdAt: string;
};

/** The list's `status` filter: Upcoming = active plans (Subscription tab), Completed = used up (Completed tab). */
export type SubscriptionFilter = 'Upcoming' | 'Completed';

/** "Subscription #N" counts the buyer's plans in purchase order, the same on every tab. */
export function subscriptionNumbers(
  all: Pick<UserSubscription, 'id' | 'createdAt'>[],
): Map<string, number> {
  const sorted = [...all].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return new Map(sorted.map((s, i) => [s.id, i + 1]));
}

export type PlanAction =
  | { kind: 'schedule'; label: 'Start Scheduling' }
  | { kind: 'bookAgain'; label: 'Book Again' }
  | { kind: 'none'; label: 'Expired' | 'Fully used' };

/** The card's main button (the app's SubscriptionEntitlementCard). */
export function planAction(
  s: Pick<UserSubscription, 'status' | 'availableToSchedule'>,
): PlanAction {
  if (s.status === 'COMPLETED') return { kind: 'bookAgain', label: 'Book Again' };
  if (s.status === 'EXPIRED') return { kind: 'none', label: 'Expired' };
  if (s.availableToSchedule <= 0) return { kind: 'none', label: 'Fully used' };
  return { kind: 'schedule', label: 'Start Scheduling' };
}

export function canBookFromPlan(
  s: Pick<UserSubscription, 'status' | 'availableToSchedule'>,
): boolean {
  return planAction(s).kind === 'schedule';
}

/** "06 Nov 2026" in the browser's zone (the app's formatDateWithTimeZone "dd MMM yyyy"). */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "NPR 10200 / paid" (the app rounds the amount). */
export function paidLabel(amount: Price | null | undefined): string {
  return amount ? `${amount.currency} ${Math.round(amount.value)} / paid` : '';
}
