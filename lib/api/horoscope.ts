/**
 * Astro Sewa backend — astrology horoscope endpoints.
 * Base: GET/POST /api/v1/astrology/horoscope (HoroscopeController).
 */

import type { AstroBackendResult } from '@/lib/types/api';
import type { HoroscopeRecord, HoroscopeSign } from '@/lib/types/horoscope';
import { readAstroBackendResult } from '@/lib/utils/api';
import { getPublicBackendBaseUrl, joinUrl } from '@/lib/utils/url';

/** Full URL for the horoscope collection (active list). */
export function getHoroscopesUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), 'api/v1/astrology/horoscope');
}

/** Full URL for one sign's active horoscope. */
export function getHoroscopeBySignUrl(sign: HoroscopeSign): string {
  return joinUrl(getPublicBackendBaseUrl(), `api/v1/astrology/horoscope/${sign}`);
}

/** Admin sync endpoint (JWT + ADMIN role on backend). */
export function getHoroscopeSyncUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), 'api/v1/astrology/horoscope/sync');
}

/** All active horoscopes (public GET). */
export async function fetchActiveHoroscopes(
  init?: RequestInit,
): Promise<AstroBackendResult<HoroscopeRecord[]>> {
  const response = await fetch(getHoroscopesUrl(), {
    ...init,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  return readAstroBackendResult<HoroscopeRecord[]>(response, 'horoscope API');
}

/** One active horoscope by sign (public GET). */
export async function fetchHoroscopeBySign(
  sign: HoroscopeSign,
  init?: RequestInit,
): Promise<AstroBackendResult<HoroscopeRecord>> {
  const response = await fetch(getHoroscopeBySignUrl(sign), {
    ...init,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  return readAstroBackendResult<HoroscopeRecord>(response, 'horoscope API');
}

/** Trigger provider sync (POST, admin JWT). */
export async function postHoroscopeSync(
  accessToken: string,
  init?: RequestInit,
): Promise<AstroBackendResult<void>> {
  const response = await fetch(getHoroscopeSyncUrl(), {
    ...init,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
  return readAstroBackendResult<void>(response, 'horoscope sync API');
}
