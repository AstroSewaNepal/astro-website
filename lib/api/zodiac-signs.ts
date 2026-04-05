/**
 * Astro Sewa backend — public zodiac sign catalog.
 * Base: GET /api/v1/users/zodiac-signs (ZodiacSignPublicController).
 * Response bodies are plain JSON arrays/objects, not the Result wrapper.
 */

import type { ZodiacSignRecord, ZodiacType } from '@/lib/types/zodiac-signs';
import { readJsonOk } from '@/lib/utils/api';
import { getPublicBackendBaseUrl, joinUrl } from '@/lib/utils/url';

/** Full URL for all zodiac signs. */
export function getZodiacSignsUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), 'api/v1/users/zodiac-signs');
}

/** Full URL for zodiac signs filtered by type (sun/moon). */
export function getZodiacSignsByTypeUrl(type: ZodiacType): string {
  return joinUrl(
    getPublicBackendBaseUrl(),
    `api/v1/users/zodiac-signs/type/${type}`,
  );
}

/** Full URL for a single zodiac sign by Mongo id. */
export function getZodiacSignByIdUrl(id: string): string {
  return joinUrl(getPublicBackendBaseUrl(), `api/v1/users/zodiac-signs/${id}`);
}

/** All zodiac signs (public GET). */
export async function fetchZodiacSigns(
  init?: RequestInit,
): Promise<ZodiacSignRecord[]> {
  const response = await fetch(getZodiacSignsUrl(), {
    ...init,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  return readJsonOk<ZodiacSignRecord[]>(response, 'zodiac signs API');
}

/** Filter by sun / moon (public GET). */
export async function fetchZodiacSignsByType(
  type: ZodiacType,
  init?: RequestInit,
): Promise<ZodiacSignRecord[]> {
  const response = await fetch(getZodiacSignsByTypeUrl(type), {
    ...init,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  return readJsonOk<ZodiacSignRecord[]>(response, 'zodiac signs API');
}

/** Single catalog row by Mongo id (public GET). */
export async function fetchZodiacSignById(
  id: string,
  init?: RequestInit,
): Promise<ZodiacSignRecord> {
  const response = await fetch(getZodiacSignByIdUrl(id), {
    ...init,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  return readJsonOk<ZodiacSignRecord>(response, 'zodiac signs API');
}
