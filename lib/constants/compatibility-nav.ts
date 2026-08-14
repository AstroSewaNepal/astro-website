import type { HoroscopeSign } from '@/lib/types/horoscope';

type CompatibilityGender = 'male' | 'female';

export function compatibilityMatchHref(
  yourSign: HoroscopeSign,
  partnerSign: HoroscopeSign,
  yourGender: CompatibilityGender = 'male',
  partnerGender: CompatibilityGender = 'female',
): string {
  const yg = yourGender === 'male' ? 'man' : 'woman';
  const pg = partnerGender === 'male' ? 'man' : 'woman';
  return `/compatibility/${yourSign}-${yg}-and-${partnerSign}-${pg}`;
}

export function parseCompatibilitySlug(slug: string): {
  yourSign?: HoroscopeSign;
  partnerSign?: HoroscopeSign;
  yourGender?: CompatibilityGender;
  partnerGender?: CompatibilityGender;
} | null {
  const match = slug.match(/^([a-z]+)-(man|woman)-and-([a-z]+)-(man|woman)$/i);
  if (!match) return null;

  return {
    yourSign: match[1].toLowerCase() as HoroscopeSign,
    yourGender: match[2].toLowerCase() === 'man' ? 'male' : 'female',
    partnerSign: match[3].toLowerCase() as HoroscopeSign,
    partnerGender: match[4].toLowerCase() === 'man' ? 'male' : 'female',
  };
}
