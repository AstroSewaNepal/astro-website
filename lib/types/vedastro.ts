/**
 * Vedastro Nest API — DTOs aligned with backend / `VEDASTRO_API` integration guide.
 * Base: `/api/v1/vedastro/*`
 */

export type ApiErrorItem = { statusCode: number; message: string };

/** Standard Nest `Result<T>` envelope for Vedastro controllers. */
export type ResultEnvelope<T> = {
  success: boolean;
  data: T | null;
  message?: string;
  time: string;
  errors?: ApiErrorItem[];
  pagination?: { total: number; page: number; limit: number };
};

/** Horoscope range query `type` (lowercase). */
export type VedastroHoroscopeRangeType =
  | 'today'
  | 'yesterday'
  | 'tomorrow'
  | 'week'
  | 'month'
  | 'year';

export type HoroscopeSummaryRow = {
  sign: string;
  slug: string;
  rating: number;
  summary: string;
};

export type HoroscopeListData = {
  type: string;
  start_date: string;
  end_date: string;
  date: string;
  data: HoroscopeSummaryRow[];
};

export type AstroSignals = {
  moon_sign: string;
  mercury_retrograde: boolean;
  energy_score: number;
  emotional_intensity: 'low' | 'medium' | 'high';
};

export type HoroscopeDetailData = {
  sign: string;
  basic: {
    date_range: string;
    element: string;
    ruling_planet: string;
  };
  personality: {
    traits: string;
    strengths: string[];
    weaknesses: string[];
  };
  compatibility: unknown[];
  horoscope: {
    type: string;
    start_date: string;
    end_date: string;
    general: string;
    love: string;
    career: string;
    health: string;
  };
  astro_signals: AstroSignals;
};

export type HoroscopePrecomputeResult = {
  range_type: VedastroHoroscopeRangeType;
  period_key: string;
  attempted: number;
  saved: number;
  skipped: number;
  failed: number;
};

export type RecomputeResponseData = {
  ranges: HoroscopePrecomputeResult[];
};

export type RecomputeRequestBody = {
  rangeType?: VedastroHoroscopeRangeType;
  force?: boolean;
};

export type GeneratedHoroscopeData = {
  date: string;
  location: string;
  time: string;
  timezoneOffset: string;
  source: 'HoroscopePredictions';
  payload?: unknown;
  generatedAt: string;
};

export type RawHoroscopeQuery = {
  date: string;
  location?: string;
  time?: string;
  timezoneOffset?: string;
};

export type ZodiacCompatibilityRequestDto = {
  your_sign: string;
  your_gender: 'male' | 'female';
  partner_sign: string;
  partner_gender: 'male' | 'female';
};

export type ZodiacCompatCategoryKey =
  | 'love'
  | 'sex'
  | 'friendship'
  | 'communication'
  | 'strength'
  | 'weakness';

export type ZodiacCompatCategory = {
  key: ZodiacCompatCategoryKey;
  label: string;
  match_percent: number;
  narrative: string;
};

export type ZodiacCompatibilityData = {
  methodology: string;
  same_gender_api_note?: string;
  overall_match_percent: number;
  vedastro_summary: {
    heart_icon?: string;
    score_color?: string;
    score_summary?: string;
  };
  your: { sign: string; slug: string; gender: string };
  partner: { sign: string; slug: string; gender: string };
  categories: ZodiacCompatCategory[];
  predictions: Array<Record<string, unknown>>;
};

export type SeedZodiacSignData = {
  already_seeded: boolean;
  total: number;
};

/** Mongo zodiac row (GET list / detail). */
export type VedastroZodiacSignRow = {
  slug: string;
  sign: string;
  date_range: string;
  element: string;
  ruling_planet: string;
  card_summary: string;
  intro: string;
  compatibility: string[];
  strengths: string[];
  weaknesses: string[];
  personality_traits: string;
  cta_label: string;
  rating: number;
  source: string;
  last_synced_at: string;
};
