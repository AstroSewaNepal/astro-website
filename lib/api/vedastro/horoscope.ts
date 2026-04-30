import type {
  GeneratedHoroscopeData,
  HoroscopeDetailData,
  HoroscopeListData,
  RawHoroscopeQuery,
  RecomputeRequestBody,
  RecomputeResponseData,
  ResultEnvelope,
  VedastroHoroscopeRangeType,
} from '@/lib/types/vedastro';
import { vedastroPath } from './constants';
import { vedastroGet, vedastroPost, type VedastroFetchOptions } from './http';

/** `GET /vedastro/horoscope/list` */
export function getVedastroHoroscopeListUrl(type?: VedastroHoroscopeRangeType): string {
  const url = new URL(vedastroPath('horoscope', 'list'));
  if (type) {
    url.searchParams.set('type', type);
  }
  return url.toString();
}

/** `GET /vedastro/horoscope/{sign}?type=` */
export function getVedastroHoroscopeDetailUrl(
  sign: string,
  type?: VedastroHoroscopeRangeType,
): string {
  const slug = sign.trim().toLowerCase();
  const url = new URL(vedastroPath('horoscope', slug));
  if (type) {
    url.searchParams.set('type', type);
  }
  return url.toString();
}

/**
 * `GET /vedastro/horoscope` — raw HoroscopePredictions (query only, no extra path segment).
 */
export function getVedastroRawHoroscopeUrl(query: RawHoroscopeQuery): string {
  const url = new URL(vedastroPath('horoscope'));
  url.searchParams.set('date', query.date);
  if (query.location) url.searchParams.set('location', query.location);
  if (query.time) url.searchParams.set('time', query.time);
  if (query.timezoneOffset) {
    url.searchParams.set('timezoneOffset', query.timezoneOffset);
  }
  return url.toString();
}

/** `POST /vedastro/horoscope/recompute` */
export function getVedastroHoroscopeRecomputeUrl(): string {
  return vedastroPath('horoscope', 'recompute');
}

export async function fetchVedastroHoroscopeList(
  params?: { type?: VedastroHoroscopeRangeType },
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<HoroscopeListData>> {
  return vedastroGet<HoroscopeListData>(
    getVedastroHoroscopeListUrl(params?.type),
    init,
  );
}

export async function fetchVedastroHoroscopeDetail(
  sign: string,
  params?: { type?: VedastroHoroscopeRangeType },
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<HoroscopeDetailData>> {
  return vedastroGet<HoroscopeDetailData>(
    getVedastroHoroscopeDetailUrl(sign, params?.type),
    init,
  );
}

export async function fetchVedastroRawHoroscope(
  query: RawHoroscopeQuery,
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<GeneratedHoroscopeData>> {
  return vedastroGet<GeneratedHoroscopeData>(
    getVedastroRawHoroscopeUrl(query),
    init,
  );
}

export async function postVedastroHoroscopeRecompute(
  body?: RecomputeRequestBody,
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<RecomputeResponseData>> {
  return vedastroPost<RecomputeResponseData, RecomputeRequestBody>(
    getVedastroHoroscopeRecomputeUrl(),
    body ?? {},
    init,
  );
}
