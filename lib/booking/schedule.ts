// Schedule appointment, as the app's ScheduleAppointmentScreen + utils/dateUtils (AD only: the app disables BS).
// Slots come back in the browser's time zone (the backend client sends x-timezone), and so do the dates here.

export type CalendarDate = { year: number; month: number; day: number };

export type BackendSlot = { start: string; end: string; isAvailable?: boolean };

/** GET /astrologers/:id/available-slots */
export type SlotsResponse = { availableSlots?: BackendSlot[] | null };

export type Slot = { start: string; end: string; available: boolean };

export type SlotGroups = {
  morning: Slot[];
  afternoon: Slot[];
  evening: Slot[];
  night: Slot[];
};

export const SLOT_GROUPS: { id: keyof SlotGroups; title: string }[] = [
  { id: 'morning', title: 'Morning Slots' },
  { id: 'afternoon', title: 'Afternoon Slots' },
  { id: 'evening', title: 'Evening Slots' },
  { id: 'night', title: 'Night Slots' },
];

const pad = (n: number) => String(n).padStart(2, '0');

export function toCalendarDate(date: Date): CalendarDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

/** "2026-11-06": the `date` the slots endpoint takes. */
export function dateKey({ year, month, day }: CalendarDate): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type Option = { value: number; label: string; disabled: boolean };

/** This year and the next nine (the app's generateYearOptions(10)). */
export function yearOptions(today: CalendarDate): Option[] {
  return Array.from({ length: 10 }, (_, i) => ({
    value: today.year + i,
    label: String(today.year + i),
    disabled: false,
  }));
}

/** Months of `year`; this year's past months are disabled. */
export function monthOptions(year: number, today: CalendarDate): Option[] {
  return MONTHS.map((label, i) => ({
    value: i + 1,
    label,
    disabled: year === today.year && i + 1 < today.month,
  }));
}

export type CalendarDay = { day: number; dayName: string; isToday: boolean; disabled: boolean };

/** The month's days for the day strip; days before today are disabled. */
export function monthDays(year: number, month: number, today: CalendarDate): CalendarDay[] {
  const count = new Date(year, month, 0).getDate();
  const todayKey = dateKey(today);
  return Array.from({ length: count }, (_, i) => {
    const day = i + 1;
    const key = dateKey({ year, month, day });
    return {
      day,
      dayName: DAY_NAMES[new Date(year, month - 1, day).getDay()],
      isToday: key === todayKey,
      disabled: key < todayKey,
    };
  });
}

/** Moving to another year keeps the month unless it would be in the past (the app's handleYearChange). */
export function monthForYear(year: number, currentMonth: number, today: CalendarDate): number {
  if (year === today.year) return Math.max(currentMonth, today.month);
  if (year > today.year) return 1;
  return currentMonth;
}

/** First day of a month that can still be booked: today in the current month, else the 1st. */
export function firstBookableDay(year: number, month: number, today: CalendarDate): number {
  return year === today.year && month === today.month ? today.day : 1;
}

/** "14:00" -> "2:00 PM" (the app's formatTime24to12). */
export function formatTime12(time: string): string {
  const [h, m] = time.split(':');
  const hour = Number(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function groupOf(hour: number): keyof SlotGroups {
  if (hour < 5) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * The app's dedupe + sort + groupSlotsByTimeOfDay: a slot can only be picked when the backend says it's free and it
 * starts at least `durationMinutes` from now.
 */
export function groupSlots(
  slots: BackendSlot[],
  date: CalendarDate,
  durationMinutes: number,
  now: Date,
): SlotGroups {
  const groups: SlotGroups = { morning: [], afternoon: [], evening: [], night: [] };
  const seen = new Set<string>();
  const sorted = slots
    .filter(s => s.start && s.end)
    .filter(s => {
      const key = `${s.start}-${s.end}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  for (const s of sorted) {
    const [h, m] = s.start.split(':').map(Number);
    const startsAt = new Date(date.year, date.month - 1, date.day, h, m);
    const minutesAway = (startsAt.getTime() - now.getTime()) / 60000;
    groups[groupOf(h)].push({
      start: s.start,
      end: s.end,
      available: (s.isAvailable ?? true) && minutesAway >= durationMinutes,
    });
  }
  return groups;
}

export function hasFreeSlot(slots: BackendSlot[] | null | undefined): boolean {
  return !!slots?.some(s => s.isAvailable);
}

/**
 * Wall-clock times of the booking in the buyer's zone, as the app sends them (the backend reads them with
 * `timeZone`). A slot ending at 00:00 ends the next day.
 */
export function bookingTimes(
  date: CalendarDate,
  slot: Pick<Slot, 'start' | 'end'>,
): { scheduledStartAt: string; scheduledEndAt: string } {
  const start = dateKey(date);
  const endDate =
    slot.end === '00:00' ? toCalendarDate(new Date(date.year, date.month - 1, date.day + 1)) : date;
  return {
    scheduledStartAt: `${start}T${slot.start}:00`,
    scheduledEndAt: `${dateKey(endDate)}T${slot.end}:00`,
  };
}

/** The app looks for the first day with a free slot: up to 90 days ahead, 15 days per round of requests. */
export const EARLIEST_SEARCH_DAYS = 90;
export const EARLIEST_BATCH = 15;

export function dayBatch(
  from: CalendarDate,
  offset: number,
  size = EARLIEST_BATCH,
): CalendarDate[] {
  return Array.from({ length: size }, (_, i) =>
    toCalendarDate(new Date(from.year, from.month - 1, from.day + offset + i)),
  );
}
