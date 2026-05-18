import SunCalc from 'suncalc';

import { PANCHANG_DEFAULT_GEO } from './panchang-utils';

function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function sameLocalCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** If moonset is after local midnight, show the civil date so it matches printed panchang apps. */
function formatMoonLine(selectedDay: Date, event: Date): string {
  const clock = formatClock(event);
  if (sameLocalCalendarDay(selectedDay, event)) return clock;
  const suffix = event.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${clock}, ${suffix}`;
}

export const MOON_RISE_SET_SOURCE_NOTE =
  'Moonrise & moonset are computed locally for your selected date at the map coordinates above (suncalc). VedAstro PanchangaTable includes Sun times only.';

/**
 * Moon rise/set at default Panchang coordinates for the given calendar day (local date).
 */
export function moonRiseSetForPlace(calendarDay: Date): { rise: string; set: string } {
  const { lat, lon } = PANCHANG_DEFAULT_GEO;
  const ref = new Date(
    calendarDay.getFullYear(),
    calendarDay.getMonth(),
    calendarDay.getDate(),
    12,
    0,
    0,
  );

  const mt = SunCalc.getMoonTimes(ref, lat, lon) as SunCalc.GetMoonTimes & {
    alwaysUp?: boolean;
    alwaysDown?: boolean;
  };

  if (mt.alwaysDown) {
    return { rise: '—', set: '—' };
  }
  if (mt.alwaysUp) {
    return { rise: 'Always above horizon', set: 'Always above horizon' };
  }

  const riseOk = mt.rise && !Number.isNaN(mt.rise.getTime());
  const setOk = mt.set && !Number.isNaN(mt.set.getTime());

  return {
    rise: riseOk ? formatMoonLine(calendarDay, mt.rise!) : '—',
    set: setOk ? formatMoonLine(calendarDay, mt.set!) : '—',
  };
}
