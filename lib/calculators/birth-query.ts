import { birthTimePartsToInput, type BirthTimeParts } from '@/components/shared/birth-time-fields';

import type { CalculatorFormValues } from './calculator-form-types';
import { geocodePlace } from './geocode-place';

/** ISO yyyy-mm-dd → VedAstro DD-MM-YYYY */
export function isoDateToVedastroDate(iso: string): string | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

export function getLocalOffsetFromIsoDate(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '+00:00';
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formBirthTimeToHHMM(form: CalculatorFormValues): string {
  if (form.dontKnowTime) return '12:00';

  const parts: BirthTimeParts = {
    hh: form.birthTimeHH,
    mm: form.birthTimeMM,
    ampm: form.birthTimeAMPM,
  };
  return birthTimePartsToInput(parts) ?? '12:00';
}

export type BirthVedastroQuery = {
  lat: string;
  lon: string;
  date: string;
  time: string;
  offset: string;
  location: string;
};

export async function buildBirthVedastroQuery(
  form: CalculatorFormValues,
): Promise<BirthVedastroQuery> {
  if (!form.birthDate) {
    throw new Error('Please enter your date of birth.');
  }
  if (!form.birthPlace.trim()) {
    throw new Error('Please enter your birth place.');
  }

  const vedastroDate = isoDateToVedastroDate(form.birthDate);
  if (!vedastroDate) {
    throw new Error('Invalid date of birth.');
  }

  const geo = await geocodePlace(form.birthPlace);

  return {
    lat: geo.lat,
    lon: geo.lon,
    date: vedastroDate,
    time: formBirthTimeToHHMM(form),
    offset: getLocalOffsetFromIsoDate(form.birthDate),
    location: form.birthPlace.trim(),
  };
}

export function birthQueryToSearchParams(q: BirthVedastroQuery): URLSearchParams {
  return new URLSearchParams({
    lat: q.lat,
    lon: q.lon,
    date: q.date,
    time: q.time,
    offset: q.offset,
    location: q.location,
  });
}
