// A paid package that couldn't be booked (the slot went while the buyer paid) waits for the buyer to pick another
// time with the same payment (backend packages/waiting + packages/:pidx/rebook), instead of a refund.

export type WaitingPackage = {
  pidx: string;
  packageId: string;
  astrologerId: string;
  astrologerName: string | null;
  packageType: string | null;
  consultationMinutes: number | null;
  amount: number;
  currency: string;
  paidAt: string;
  rebookBy: string;
  reason: string | null;
};

export const WAITING_PACKAGES_PATH = '/subscription/payments/packages/waiting';

export function rebookApiPath(pidx: string): string {
  return `/subscription/payments/packages/${encodeURIComponent(pidx)}/rebook`;
}

/** The schedule page for that package, booking with the payment already made. */
export function rebookPath(w: Pick<WaitingPackage, 'astrologerId' | 'packageId' | 'pidx'>): string {
  const params = new URLSearchParams({ package: w.packageId, paid: w.pidx });
  return `/astrologer-profile/${encodeURIComponent(w.astrologerId)}/schedule?${params.toString()}`;
}

/** "Basic · 15 min with Rowisee" */
export function waitingLabel(w: WaitingPackage): string {
  const what = [w.packageType, w.consultationMinutes ? `${w.consultationMinutes} min` : null]
    .filter(Boolean)
    .join(' · ');
  const who = w.astrologerName ? ` with ${w.astrologerName}` : '';
  return `${what || 'Consultation'}${who}`;
}

/** "8 Dec 2026" */
export function rebookByLabel(w: Pick<WaitingPackage, 'rebookBy'>): string {
  const d = new Date(w.rebookBy);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
