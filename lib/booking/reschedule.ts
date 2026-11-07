// Reschedule a booked consultation, as the app's ScheduleAppointmentScreen with a connectionId + RescheduleReasonModal.

import { clockTime } from '@/lib/booking/consultations';
import {
  toCalendarDate,
  dateKey,
  type BackendSlot,
  type CalendarDate,
} from '@/lib/booking/schedule';

/** GET /connection-schedule/:id (the parts rescheduling uses). Times come back in the x-timezone zone. */
export type BookingDetails = {
  _id: string;
  astrologerId: string;
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  package?: { _id?: string; packageType?: string; consultationMinutes?: number } | null;
  subscriptionId?: string | null;
};

const profileBase = (astrologerId: string) =>
  `/astrologer-profile/${encodeURIComponent(astrologerId)}`;

/** My Consultations' Reschedule: the schedule page for that booking. */
export function reschedulePath(astrologerId: string, bookingId: string): string {
  return `${profileBase(astrologerId)}/schedule?booking=${encodeURIComponent(bookingId)}`;
}

/** The booking's day and slot in the browser's zone, or null when its times can't be read. */
export function bookedSlot(
  b: Pick<BookingDetails, 'scheduledStartAt' | 'scheduledEndAt'>,
): { date: CalendarDate; start: string; end: string } | null {
  const start = new Date(b.scheduledStartAt);
  if (Number.isNaN(start.getTime())) return null;
  const startTime = clockTime(b.scheduledStartAt);
  const endTime = clockTime(b.scheduledEndAt);
  if (!startTime || !endTime) return null;
  return { date: toCalendarDate(start), start: startTime, end: endTime };
}

/** On the booked day the current slot is listed but can't be picked again (the app adds it as unavailable). */
export function withBookedSlot(
  slots: BackendSlot[],
  day: CalendarDate,
  booked: ReturnType<typeof bookedSlot>,
): BackendSlot[] {
  if (!booked || dateKey(booked.date) !== dateKey(day)) return slots;
  return [
    ...slots.filter(s => !(s.start === booked.start && s.end === booked.end)),
    { start: booked.start, end: booked.end, isAvailable: false },
  ];
}

/** Bookings that are over or called off can't move; nor can one that is running now (the app's rule). */
const CLOSED = new Set(['COMPLETED', 'CANCELLED']);

export function rescheduleBlock(
  b: Pick<BookingDetails, 'status' | 'scheduledStartAt' | 'scheduledEndAt'>,
  now: Date,
): 'closed' | 'inProgress' | null {
  if (CLOSED.has(String(b.status).toUpperCase())) return 'closed';
  const start = new Date(b.scheduledStartAt);
  const end = new Date(b.scheduledEndAt);
  if (now >= start && now <= end) return 'inProgress';
  if (now > end) return 'closed';
  return null;
}

/** The app's RescheduleReasonModal choices; the label is what the backend stores. */
export const RESCHEDULE_REASONS = [
  { key: 'dateTimeChange', label: 'I need to change the date/time' },
  { key: 'schedulingConflict', label: 'I have a scheduling conflict' },
  { key: 'personalEmergency', label: 'Personal emergency' },
  { key: 'other', label: 'Other' },
] as const;

export type RescheduleReasonKey = (typeof RESCHEDULE_REASONS)[number]['key'];

/** The reason sent, or '' while the choice is incomplete ("Other" needs text). */
export function rescheduleReason(key: RescheduleReasonKey | null, other: string): string {
  if (!key) return '';
  if (key === 'other') return other.trim();
  return RESCHEDULE_REASONS.find(r => r.key === key)?.label ?? '';
}
