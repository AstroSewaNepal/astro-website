import { describe, expect, it } from 'vitest';

import {
  bookedSlot,
  rescheduleBlock,
  reschedulePath,
  rescheduleReason,
  withBookedSlot,
} from '@/lib/booking/reschedule';

// Vitest runs with TZ unset; build the booking's times from local parts so the checks don't depend on the zone.
const local = (h: number, m: number) => new Date(2026, 10, 20, h, m).toISOString();
const booking = {
  status: 'CONFIRMED',
  scheduledStartAt: local(13, 30),
  scheduledEndAt: local(14, 0),
};

describe('reschedule', () => {
  it('links to the schedule page for the booking', () => {
    expect(reschedulePath('a 1', 'b/2')).toBe('/astrologer-profile/a%201/schedule?booking=b%2F2');
  });

  it('reads the booked day and slot in the browser zone', () => {
    expect(bookedSlot(booking)).toEqual({
      date: { year: 2026, month: 11, day: 20 },
      start: '13:30',
      end: '14:00',
    });
    expect(bookedSlot({ scheduledStartAt: 'nope', scheduledEndAt: 'nope' })).toBeNull();
  });

  it('lists the booked slot as taken on its own day only', () => {
    const booked = bookedSlot(booking);
    const slots = [
      { start: '13:00', end: '13:30', isAvailable: true },
      { start: '13:30', end: '14:00', isAvailable: true },
    ];
    expect(withBookedSlot(slots, { year: 2026, month: 11, day: 20 }, booked)).toEqual([
      { start: '13:00', end: '13:30', isAvailable: true },
      { start: '13:30', end: '14:00', isAvailable: false },
    ]);
    expect(withBookedSlot(slots, { year: 2026, month: 11, day: 21 }, booked)).toBe(slots);
  });

  it('blocks running, finished and called-off bookings', () => {
    expect(rescheduleBlock(booking, new Date(2026, 10, 20, 12, 0))).toBeNull();
    expect(rescheduleBlock(booking, new Date(2026, 10, 20, 13, 45))).toBe('inProgress');
    expect(rescheduleBlock(booking, new Date(2026, 10, 20, 15, 0))).toBe('closed');
    expect(rescheduleBlock({ ...booking, status: 'CANCELLED' }, new Date(2026, 10, 1))).toBe(
      'closed',
    );
  });

  it('sends the chosen label, or the typed text for Other', () => {
    expect(rescheduleReason(null, '')).toBe('');
    expect(rescheduleReason('personalEmergency', '')).toBe('Personal emergency');
    expect(rescheduleReason('other', '   ')).toBe('');
    expect(rescheduleReason('other', ' Travelling ')).toBe('Travelling');
  });
});
