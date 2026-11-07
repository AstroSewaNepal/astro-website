import { describe, expect, it } from 'vitest';

import {
  canBookFromPlan,
  paidLabel,
  planAction,
  shortDate,
  subscriptionNumbers,
} from './subscriptions';

describe('planAction', () => {
  it('follows the app card', () => {
    expect(planAction({ status: 'ACTIVE', availableToSchedule: 2 }).label).toBe('Start Scheduling');
    expect(planAction({ status: 'ACTIVE', availableToSchedule: 0 }).label).toBe('Fully used');
    expect(planAction({ status: 'EXPIRED', availableToSchedule: 3 }).label).toBe('Expired');
    expect(planAction({ status: 'COMPLETED', availableToSchedule: 0 }).kind).toBe('bookAgain');
    expect(canBookFromPlan({ status: 'ACTIVE', availableToSchedule: 1 })).toBe(true);
    expect(canBookFromPlan({ status: 'EXPIRED', availableToSchedule: 1 })).toBe(false);
  });
});

it('numbers plans in purchase order', () => {
  const n = subscriptionNumbers([
    { id: 'b', createdAt: '2026-10-02T00:00:00Z' },
    { id: 'a', createdAt: '2026-09-01T00:00:00Z' },
  ]);
  expect(n.get('a')).toBe(1);
  expect(n.get('b')).toBe(2);
});

it('formats the date and the amount paid', () => {
  expect(shortDate('2026-12-06T10:00:00Z')).toBe('06 Dec 2026');
  expect(shortDate('nope')).toBe('');
  expect(paidLabel({ currency: 'NPR', value: 10199.6 })).toBe('NPR 10200 / paid');
  expect(paidLabel(null)).toBe('');
});
