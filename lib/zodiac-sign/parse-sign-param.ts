import { isHoroscopeSign, type HoroscopeSign } from '@/lib/types/horoscope';

export function parseZodiacSignParam(raw: string | null): HoroscopeSign {
  const s = raw?.trim().toLowerCase() ?? '';
  if (s && isHoroscopeSign(s)) {
    return s;
  }
  return 'aries';
}
