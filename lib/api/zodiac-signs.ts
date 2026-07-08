/**
 * Zodiac catalog — backed by Vedastro `GET /api/v1/vedastro/zodiac-sign` (+ detail by slug).
 * Legacy {@link ZodiacSignRecord} shape is mapped for callers that still use it.
 */

import {
  fetchVedastroZodiacSignBySlug,
  fetchVedastroZodiacSignList,
} from '@/lib/api/vedastro/zodiac-sign';
import type { VedastroFetchOptions } from '@/lib/api/vedastro/http';
import type { VedastroZodiacSignRow } from '@/lib/types/vedastro';
import type { ZodiacSignRecord, ZodiacType, AstroSewaZodiacSignResponse } from '@/lib/types/zodiac-signs';
import { unwrapResult } from '@/lib/utils/vedastro-result';
import { getPublicBackendBaseUrl, joinUrl } from '@/lib/utils/url';

function parseVedastroDateRange(
  dateRange: string | { from?: string; to?: string } | unknown,
): { from: string; to: string } {
  if (typeof dateRange === 'string') {
    const parts = dateRange.split(/\s*[-–]\s*/);
    return {
      from: parts[0]?.trim() ?? dateRange,
      to: parts[1]?.trim() ?? '',
    };
  }

  if (typeof dateRange === 'object' && dateRange !== null) {
    const maybeRange = dateRange as { from?: unknown; to?: unknown; start?: unknown; end?: unknown };
    const from = typeof maybeRange.from === 'string'
      ? maybeRange.from
      : typeof maybeRange.start === 'string'
      ? maybeRange.start
      : '';
    const to = typeof maybeRange.to === 'string'
      ? maybeRange.to
      : typeof maybeRange.end === 'string'
      ? maybeRange.end
      : '';
    return {
      from: from.trim(),
      to: to.trim(),
    };
  }

  return { from: '', to: '' };
}

function mapVedastroDetailRow(
  row: VedastroZodiacSignRow,
): AstroSewaZodiacSignResponse {
  const date_range = parseVedastroDateRange(row.date_range);

  const translation = {
    name: row.sign,
    subtitle: '',
    card_summary: row.card_summary,
    hero_description: row.intro,
    intro: row.intro,
    personality_traits: row.personality_traits,
    strengths: row.strengths,
    weaknesses: row.weaknesses,
    cta_label: row.cta_label,
    seo: {
      title: row.sign,
      description: row.card_summary,
      keywords: [],
    },
  };

  return {
    _id: row.slug,
    slug: row.slug,
    sign_key: row.slug,
    display_order: 0,
    date_range,
    element: row.element,
    modality: '',
    symbol: '',
    compatibility: row.compatibility ?? [],
    ruling_planets: row.ruling_planet ? [row.ruling_planet] : [],
    lucky: {
      numbers: [],
      colors: [],
      days: [],
      gemstones: [],
    },
    translations: {
      en: translation,
      ne: translation,
    },
    status: 'active',
    version: 1,
  };
}

function mapRow(row: VedastroZodiacSignRow): ZodiacSignRecord {
  return {
    _id: row.slug,
    sign_key: row.slug,
    name_en: row.sign,
    name_ne: row.sign,
    name_hi: row.sign,
    type: 'sun',
    ruling_planet_en: row.ruling_planet,
    ruling_planet_np: row.ruling_planet,
    element_en: row.element,
    element_np: row.element,
    created_at: row.last_synced_at,
    updated_at: row.last_synced_at,
    nakshatras_en: row.compatibility ?? [],
    nakshatras_np: [],
  };
}

/** @deprecated Prefer `getVedastroZodiacSignListUrl` from `@/lib/api/vedastro`. */
export function getZodiacSignsUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), 'vedastro/zodiac-sign');
}

/** @deprecated Vedastro has no type filter; returns full list (client may filter). */
export function getZodiacSignsByTypeUrl(type: ZodiacType): string {
  void type;
  return getZodiacSignsUrl();
}

/** Slug is used instead of Mongo ObjectId for Vedastro detail. */
export function getZodiacSignByIdUrl(id: string): string {
  return joinUrl(getPublicBackendBaseUrl(), `vedastro/zodiac-sign/${id}`);
}

/** All zodiac rows from Vedastro / Mongo. */
export async function fetchZodiacSigns(
  init?: VedastroFetchOptions,
): Promise<ZodiacSignRecord[]> {
  const envelope = await fetchVedastroZodiacSignList(init);
  const rows = unwrapResult(envelope);
  return rows.map(mapRow);
}

/**
 * Vedastro does not expose `sun`/`moon` split; returns same list (filter client-side if needed).
 */
export async function fetchZodiacSignsByType(
  type: ZodiacType,
  init?: VedastroFetchOptions,
): Promise<ZodiacSignRecord[]> {
  const all = await fetchZodiacSigns(init);
  return all.filter(r => r.type === type);
}

/** Pass **slug** (e.g. `aries`) — Vedastro detail is by slug, not Mongo `_id`. */
export async function fetchZodiacSignById(
  idOrSlug: string,
  init?: VedastroFetchOptions,
): Promise<ZodiacSignRecord> {
  const envelope = await fetchVedastroZodiacSignBySlug(idOrSlug, init);
  const row = unwrapResult(envelope);
  return mapRow(row);
}
export async function fetchAstroSewaZodiacSignBySlug(
  slug: string,
  init?: VedastroFetchOptions,
): Promise<AstroSewaZodiacSignResponse> {
  const envelope = await fetchVedastroZodiacSignBySlug(slug, init);
  const row = unwrapResult(envelope);
  return mapVedastroDetailRow(row);
}
