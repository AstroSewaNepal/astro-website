import { describe, expect, it } from 'vitest';

import { rebookApiPath, rebookByLabel, rebookPath, waitingLabel, type WaitingPackage } from './rebook';

const w: WaitingPackage = {
  pidx: 'uuid-1',
  packageId: 'p1',
  astrologerId: 'a1',
  astrologerName: 'Rowisee',
  packageType: 'Basic',
  consultationMinutes: 15,
  amount: 9,
  currency: 'NPR',
  paidAt: '2026-11-07T10:00:00.000Z',
  rebookBy: '2026-12-07T10:00:00.000Z',
  reason: 'Time slot is already booked',
};

describe('rebook', () => {
  it('links to the package schedule with the payment', () => {
    expect(rebookPath(w)).toBe('/astrologer-profile/a1/schedule?package=p1&paid=uuid-1');
    expect(rebookApiPath('a b')).toBe('/subscription/payments/packages/a%20b/rebook');
  });

  it('describes the waiting session', () => {
    expect(waitingLabel(w)).toBe('Basic · 15 min with Rowisee');
    expect(waitingLabel({ ...w, packageType: null, consultationMinutes: null, astrologerName: null })).toBe(
      'Consultation',
    );
    expect(rebookByLabel(w)).toBe('7 Dec 2026');
  });
});
