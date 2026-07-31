/** Backend ZodiacType enum (zodiac-sign.entity). */
export const ZODIAC_TYPES = ['sun', 'moon'] as const;
export type ZodiacType = (typeof ZODIAC_TYPES)[number];

export function isZodiacType(value: string): value is ZodiacType {
  return (ZODIAC_TYPES as readonly string[]).includes(value);
}

/** Mirrors backend ZodiacSignResponseDto (JSON field names). */
export interface ZodiacSignRecord {
  _id: string;
  sign_key: string;
  name_en: string;
  name_ne: string;
  name_hi: string;
  type: ZodiacType;
  icon_url?: string;
  ruling_planet_en: string;
  ruling_planet_np: string;
  element_en: string;
  element_np: string;
  created_at: string;
  updated_at: string;
  nakshatras_en: string[];
  nakshatras_np: string[];
}
