import { describe, expect, it } from 'vitest';

import {
  astrologerShown,
  consultationLines,
  consultationTab,
  consultationsPath,
  defaultSort,
  formatMinutes,
  isInProgress,
  planFilter,
  priceChip,
  searchPath,
  sessionNumbers,
  type Consultation,
} from './consultations';

const booking = (patch: Partial<Consultation> = {}): Consultation => ({
  _id: 'c1',
  astrologerId: 'a1',
  astrologer: { fullName: 'Rehan Khan' },
  scheduledStartAt: '2026-11-06T13:30:00+05:45',
  scheduledEndAt: '2026-11-06T14:00:00+05:45',
  status: 'CONFIRMED',
  package: { packageType: 'Basic', consultationMinutes: 30 },
  ...patch,
});

describe('tabs and query', () => {
  it('reads the tab and builds paths', () => {
    expect(consultationTab('completed')).toBe('completed');
    expect(consultationTab('x')).toBe('upcoming');
    expect(consultationsPath('subscription')).toBe('/client/consultations?tab=subscription');
    expect(consultationsPath()).toBe('/client/consultations');
    expect(planFilter('upcoming')).toBeNull();
    expect(planFilter('subscription')).toBe('Upcoming');
    expect(defaultSort('completed')).toBe('start_time_desc');
  });

  it('asks the search endpoint like the app', () => {
    const path = searchPath('u1', {
      tab: 'completed',
      page: 2,
      search: ' rehan ',
      sort: 'duration_high_low',
      from: '2026-11-01',
    });
    expect(path.startsWith('/connection-schedule-search/u1?')).toBe(true);
    const q = new URLSearchParams(path.split('?')[1]);
    expect(Object.fromEntries(q)).toEqual({
      page: '2',
      limit: '15',
      status: 'Completed',
      sortBy: 'consultationDuration',
      sortOrder: 'DESC',
      search: 'rehan',
      startDate: '2026-11-01',
    });
  });
});

describe('card', () => {
  it('formats lengths like the app', () => {
    expect(formatMinutes(30)).toBe('30 minutes');
    expect(formatMinutes(60)).toBe('1 hour');
    expect(formatMinutes(90)).toBe('1h 30min');
  });

  it('lists the lines', () => {
    const lines = consultationLines(booking());
    expect(lines.map(l => l.icon)).toEqual(['video', 'date', 'time']);
    expect(lines[0].text).toBe('30 minutes consultation');
    expect(consultationLines(booking({ subscriptionId: 's1' }))).toHaveLength(2);
  });

  it('labels the price chip', () => {
    expect(priceChip({ packageType: 'Subscription' })).toBe('Included in Plan');
    expect(priceChip({ discountedValue: { currency: 'NPR', value: 0 } })).toBe('Free');
    expect(priceChip({ discountedPrice: { currency: 'NPR', value: 849.6 } })).toBe(
      'NPR 850 / paid',
    );
    expect(priceChip(null)).toBe('');
  });

  it('hides an astrologer whose account is being deleted', () => {
    expect(
      astrologerShown(booking({ astrologer: { fullName: 'X', isPendingDeletion: true } })),
    ).toEqual({
      name: 'Astro Sewa Astrologer',
      photo: null,
      gone: true,
    });
  });

  it('numbers plan sessions after the used ones', () => {
    const items = [
      booking({ _id: 'b', subscriptionId: 's', scheduledStartAt: '2026-11-08T10:00:00Z' }),
      booking({ _id: 'a', subscriptionId: 's', scheduledStartAt: '2026-11-07T10:00:00Z' }),
      booking({ _id: 'p' }),
    ];
    const plans = new Map([['s', { usedConsultations: 2 }]]);
    const up = sessionNumbers(items, 'upcoming', plans);
    expect([up.get('a'), up.get('b'), up.get('p')]).toEqual([3, 4, undefined]);
    expect(sessionNumbers(items, 'completed', plans).get('a')).toBe(1);
  });

  it('knows a session in progress', () => {
    const c = booking();
    expect(isInProgress(c, new Date('2026-11-06T08:00:00Z'))).toBe(true);
    expect(isInProgress(c, new Date('2026-11-06T09:00:00Z'))).toBe(false);
  });
});
