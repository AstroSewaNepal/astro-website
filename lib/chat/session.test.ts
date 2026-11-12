import { describe, expect, it } from 'vitest';

import {
  countdownTone,
  formatCountdown,
  msUntilNextPhase,
  notAvailableText,
  secondsLeft,
  sessionPhase,
} from '@/lib/chat/session';

const start = new Date(2026, 10, 12, 14, 0).getTime();
const end = new Date(2026, 10, 12, 14, 30).getTime();
const b = {
  scheduledStartAt: new Date(start).toISOString(),
  scheduledEndAt: new Date(end).toISOString(),
  status: 'CONFIRMED',
};

describe('sessionPhase', () => {
  it('follows the clock', () => {
    expect(sessionPhase(b, start - 1)).toBe('not-started');
    expect(sessionPhase(b, start)).toBe('active');
    expect(sessionPhase(b, end - 1)).toBe('active');
    expect(sessionPhase(b, end)).toBe('ended');
  });

  it('is over once completed or cancelled, even inside the window', () => {
    expect(sessionPhase({ ...b, status: 'COMPLETED' }, start + 60_000)).toBe('ended');
    expect(sessionPhase({ ...b, status: 'CANCELLED' }, start - 60_000)).toBe('ended');
  });
});

describe('msUntilNextPhase', () => {
  it('counts to the start, then to the end, then stops', () => {
    expect(msUntilNextPhase(b, start - 5_000)).toBe(5_000);
    expect(msUntilNextPhase(b, start + 1_000)).toBe(end - start - 1_000);
    expect(msUntilNextPhase(b, end)).toBeNull();
    expect(msUntilNextPhase({ ...b, status: 'COMPLETED' }, start)).toBeNull();
  });

  it('caps long waits at what setTimeout can hold', () => {
    expect(msUntilNextPhase(b, start - 40 * 864e5)).toBe(2 ** 31 - 1);
  });
});

describe('countdown', () => {
  it('formats like the app', () => {
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(245)).toBe('4:05');
    expect(formatCountdown(3845)).toBe('1:04:05');
  });

  it('never goes below zero', () => {
    expect(secondsLeft(b.scheduledEndAt, end + 10_000)).toBe(0);
    expect(secondsLeft(b.scheduledEndAt, end - 90_500)).toBe(90);
  });

  it('turns amber at 5 minutes and red under 2', () => {
    expect(countdownTone(301)).toBe('calm');
    expect(countdownTone(300)).toBe('soon');
    expect(countdownTone(120)).toBe('soon');
    expect(countdownTone(119)).toBe('urgent');
  });
});

it('says when the consultation is', () => {
  expect(notAvailableText(b)).toBe(
    'The consultation is scheduled for 12 November 2026 from 14:00 to 14:30 and is not available.',
  );
});
