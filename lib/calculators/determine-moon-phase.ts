export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export function determineMoonPhase(birthDate: string): MoonPhaseName {
  const [year, month, day] = birthDate.split('-').map(Number);
  const c = Math.floor((14 - month) / 12);
  const y = year - c;
  const m = month + 12 * c - 2;
  const jd =
    day +
    Math.floor((31 * m) / 12) +
    y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    730550;
  let phase = ((jd + 4.867) / 29.53059) % 1;
  if (phase < 0) phase += 1;

  if (phase < 0.0625) return 'New Moon';
  if (phase < 0.1875) return 'Waxing Crescent';
  if (phase < 0.3125) return 'First Quarter';
  if (phase < 0.4375) return 'Waxing Gibbous';
  if (phase < 0.5625) return 'Full Moon';
  if (phase < 0.6875) return 'Waning Gibbous';
  if (phase < 0.8125) return 'Last Quarter';
  return 'Waning Crescent';
}
