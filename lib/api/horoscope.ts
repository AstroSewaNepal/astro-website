/**
 * Horoscope — backed by Vedastro Nest APIs (`/api/v1/vedastro/horoscope/*`).
 * Exposes legacy {@link AstroBackendResult} / {@link HoroscopeRecord} for existing UI (e.g. TodayHoroscope).
 */

import {
  fetchVedastroHoroscopeDetail,
  fetchVedastroHoroscopeList,
  getVedastroHoroscopeDetailUrl,
} from '@/lib/api/vedastro/horoscope';
import { postVedastroHoroscopeRecompute } from '@/lib/api/vedastro/horoscope';
import type { VedastroFetchOptions } from '@/lib/api/vedastro/http';
import type { AstroBackendResult } from '@/lib/types/api';
import type { HoroscopeDetailData, HoroscopeListData, RecomputeRequestBody, RecomputeResponseData } from '@/lib/types/vedastro';
import type { VedastroHoroscopeRangeType } from '@/lib/types/vedastro';
import type { HoroscopeRecord, HoroscopeSign } from '@/lib/types/horoscope';
import { isHoroscopeSign } from '@/lib/types/horoscope';
import { getPublicBackendBaseUrl, joinUrl } from '@/lib/utils/url';

function mapListToHoroscopeRecords(list: HoroscopeListData): HoroscopeRecord[] {
  const stamp = list.date || list.end_date || new Date().toISOString();
  return list.data.map(row => {
    const slug = row.slug.toLowerCase();
    const sign = isHoroscopeSign(slug) ? slug : (slug as HoroscopeSign);
    return {
      _id: row.slug,
      sign,
      content: row.summary,
      isActive: true,
      createdAt: stamp,
      updatedAt: stamp,
    };
  });
}

function mapDetailToHoroscopeRecord(
  sign: string,
  detail: HoroscopeDetailData,
): HoroscopeRecord {
  const slug = sign.toLowerCase();
  const h = detail.horoscope;
  const content = [
    h.general,
    `Love: ${h.love}`,
    `Career: ${h.career}`,
    `Health: ${h.health}`,
  ].join('\n\n');
  const stamp = h.end_date || h.start_date;
  return {
    _id: slug,
    sign: isHoroscopeSign(slug) ? slug : (slug as HoroscopeSign),
    content,
    isActive: true,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

/** @deprecated Prefer `getVedastroHoroscopeListUrl` from `@/lib/api/vedastro`. */
export function getHoroscopesUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), 'api/v1/vedastro/horoscope/list');
}

/** @deprecated Prefer `getVedastroHoroscopeDetailUrl` from `@/lib/api/vedastro`. */
export function getHoroscopeBySignUrl(
  sign: HoroscopeSign,
  range: VedastroHoroscopeRangeType = 'today',
): string {
  return getVedastroHoroscopeDetailUrl(sign, range);
}

/** Recompute endpoint URL (Vedastro). */
export function getHoroscopeSyncUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), 'api/v1/vedastro/horoscope/recompute');
}

/**
 * 12-sign summary (`type` defaults to `today`).
 * Maps Vedastro list → {@link HoroscopeRecord}[].
 */
export async function fetchActiveHoroscopes(
  range: VedastroHoroscopeRangeType = 'today',
  init?: VedastroFetchOptions,
): Promise<AstroBackendResult<HoroscopeRecord[]>> {
  try {
    const envelope = await fetchVedastroHoroscopeList({ type: range }, init);
    const list = envelope.data!;
    const data = mapListToHoroscopeRecords(list);
    return {
      success: true,
      data,
      time: envelope.time,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Horoscope list failed';
    return {
      success: false,
      data: null,
      time: new Date().toISOString(),
      message,
      errors: [{ message }],
    };
  }
}

/**
 * One sign; flattened to {@link HoroscopeRecord} for backward compatibility.
 */
export async function fetchHoroscopeBySign(
  sign: HoroscopeSign,
  range: VedastroHoroscopeRangeType = 'today',
  init?: VedastroFetchOptions,
): Promise<AstroBackendResult<HoroscopeRecord>> {
  try {
    const envelope = await fetchVedastroHoroscopeDetail(sign, { type: range }, init);
    const detail = envelope.data!;
    const data = mapDetailToHoroscopeRecord(sign, detail);
    return {
      success: true,
      data,
      time: envelope.time,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Horoscope detail failed';
    return {
      success: false,
      data: null,
      time: new Date().toISOString(),
      message,
      errors: [{ message }],
    };
  }
}

/** Warm / refresh horoscope cache (`POST .../recompute`). */
export async function postHoroscopeRecompute(
  body?: RecomputeRequestBody,
  init?: VedastroFetchOptions,
): Promise<AstroBackendResult<RecomputeResponseData>> {
  try {
    const envelope = await postVedastroHoroscopeRecompute(body, init);
    return {
      success: true,
      data: envelope.data!,
      time: envelope.time,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Recompute failed';
    return {
      success: false,
      data: null,
      time: new Date().toISOString(),
      message,
      errors: [{ message }],
    };
  }
}

/** @deprecated Prefer {@link postHoroscopeRecompute}; token ignored until backend adds JWT. */
export async function postHoroscopeSync(
  _accessToken: string,
  init?: VedastroFetchOptions,
): Promise<AstroBackendResult<void>> {
  const r = await postHoroscopeRecompute({}, init);
  if (!r.success) {
    return { ...r, data: null };
  }
  return {
    success: true,
    data: null,
    time: r.time,
  };
}
