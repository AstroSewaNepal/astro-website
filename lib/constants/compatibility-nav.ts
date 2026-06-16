import type { HoroscopeSign } from '@/lib/types/horoscope';

type CompatibilityGender = 'male' | 'female';

export function compatibilityMatchHref(
  yourSign: HoroscopeSign,
  partnerSign: HoroscopeSign,
  yourGender: CompatibilityGender = 'male',
  partnerGender: CompatibilityGender = 'female',
): string {
  const params = new URLSearchParams();
  params.set('your_sign', yourSign);
  params.set('partner_sign', partnerSign);
  params.set('your_gender', yourGender);
  params.set('partner_gender', partnerGender);
  return `/compatibility/compatibilityMatch?${params.toString()}`;
}
