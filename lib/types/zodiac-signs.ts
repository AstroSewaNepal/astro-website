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

export interface AstroSewaZodiacTranslation {
  name: string;
  subtitle?: string;
  card_summary?: string;
  hero_description: string;
  intro: string;
  personality_traits?: string;
  strengths?: string[];
  weaknesses?: string[];
  cta_label: string;
  seo: {
    title: string;
    description: string;
    keywords?: string[];
  };
}

export interface AstroSewaZodiacSignResponse {
  _id: string;
  slug: string;
  sign_key: string;
  display_order: number;
  date_range: { from: string; to: string };
  element: string;
  modality: string;
  symbol: string;
  compatibility: string[];
  ruling_planets: string[];
  lucky: {
    numbers: number[];
    colors: string[];
    days: string[];
    gemstones: string[];
  };
  translations: {
    en: AstroSewaZodiacTranslation;
    ne: AstroSewaZodiacTranslation;
  };
  status: string;
  version: number;
}
