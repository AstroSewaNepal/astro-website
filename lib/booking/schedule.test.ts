import { describe, expect, it } from 'vitest';

import {
  bookingTimes,
  dateKey,
  dayBatch,
  firstBookableDay,
  formatTime12,
  groupSlots,
  hasFreeSlot,
  monthDays,
  monthForYear,
  monthOptions,
  yearOptions,
} from './schedule';

const today = { year: 2026, month: 11, day: 6 };

describe('calendar', () => {
  it('lists the month with past days disabled', () => {
    const days = monthDays(2026, 11, today);
    expect(days).toHaveLength(30);
    expect(days[0]).toMatchObject({ day: 1, dayName: 'Sun', disabled: true, isToday: false });
    expect(days[5]).toMatchObject({ day: 6, dayName: 'Fri', disabled: false, isToday: true });
    expect(monthDays(2028, 2, today)).toHaveLength(29);
  });

  it('disables past months only in this year', () => {
    expect(
      monthOptions(2026, today)
        .filter(m => m.disabled)
        .map(m => m.value),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(monthOptions(2027, today).some(m => m.disabled)).toBe(false);
    expect(yearOptions(today).map(y => y.value)).toEqual([
      2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035,
    ]);
  });

  it('moves the month like the app on a year change', () => {
    expect(monthForYear(2027, 11, today)).toBe(1);
    expect(monthForYear(2026, 3, today)).toBe(11);
    expect(monthForYear(2026, 12, today)).toBe(12);
    expect(firstBookableDay(2026, 11, today)).toBe(6);
    expect(firstBookableDay(2026, 12, today)).toBe(1);
  });
});

describe('slots', () => {
  const now = new Date(2026, 10, 6, 10, 0);

  it('groups, sorts, dedupes and blocks slots that start too soon', () => {
    const g = groupSlots(
      [
        { start: '14:00', end: '14:15', isAvailable: true },
        { start: '10:00', end: '10:15', isAvailable: true },
        { start: '10:15', end: '10:30', isAvailable: true },
        { start: '10:15', end: '10:30', isAvailable: true },
        { start: '19:00', end: '19:15', isAvailable: false },
        { start: '02:00', end: '02:15', isAvailable: true },
      ],
      today,
      15,
      now,
    );
    expect(g.morning).toEqual([
      { start: '10:00', end: '10:15', available: false },
      { start: '10:15', end: '10:30', available: true },
    ]);
    expect(g.afternoon[0].available).toBe(true);
    expect(g.evening[0].available).toBe(false);
    // 02:00 today is already past.
    expect(g.night[0].available).toBe(false);
  });

  it('knows when a day has a free slot', () => {
    expect(hasFreeSlot([{ start: '10:00', end: '10:15', isAvailable: false }])).toBe(false);
    expect(hasFreeSlot([{ start: '10:00', end: '10:15', isAvailable: true }])).toBe(true);
    expect(hasFreeSlot(null)).toBe(false);
  });

  it('formats times like the app', () => {
    expect(formatTime12('00:15')).toBe('12:15 AM');
    expect(formatTime12('09:05')).toBe('9:05 AM');
    expect(formatTime12('12:00')).toBe('12:00 PM');
    expect(formatTime12('23:45')).toBe('11:45 PM');
  });
});

describe('booking times', () => {
  it('sends wall-clock times, ending next day at midnight', () => {
    expect(bookingTimes(today, { start: '10:00', end: '10:15' })).toEqual({
      scheduledStartAt: '2026-11-06T10:00:00',
      scheduledEndAt: '2026-11-06T10:15:00',
    });
    expect(
      bookingTimes({ year: 2026, month: 12, day: 31 }, { start: '23:45', end: '00:00' }),
    ).toEqual({
      scheduledStartAt: '2026-12-31T23:45:00',
      scheduledEndAt: '2027-01-01T00:00:00',
    });
  });

  it('builds the earliest-day search batches across months', () => {
    const batch = dayBatch({ year: 2026, month: 11, day: 28 }, 0, 5).map(dateKey);
    expect(batch).toEqual(['2026-11-28', '2026-11-29', '2026-11-30', '2026-12-01', '2026-12-02']);
  });
});
