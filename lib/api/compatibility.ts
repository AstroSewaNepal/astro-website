/**
 * Astro Sewa backend — kundali / Ashtakoot compatibility (match-making).
 * Base: /api/v1/astrology/match-making (MatchMakingController, JWT required).
 */

import type { AstroBackendResult } from '@/lib/types/api';
import type {
  CreateMatchMakingInput,
  MatchMakingAshtakootData,
  MatchMakingConfigInput,
} from '@/lib/types/compatibility';
import { readAstroBackendResult } from '@/lib/utils/api';
import { getPublicBackendBaseUrl, joinUrl } from '@/lib/utils/url';

const DEFAULT_CONFIG: Required<MatchMakingConfigInput> = {
  observationPoint: 'topocentric',
  language: 'en',
  ayanamsha: 'lahiri',
};

function normalizeCreateMatchMakingBody(
  input: CreateMatchMakingInput,
): Record<string, unknown> {
  const cfg = { ...DEFAULT_CONFIG, ...input.config };
  return {
    female: input.female,
    male: input.male,
    config: {
      observationPoint: cfg.observationPoint,
      language: cfg.language,
      ayanamsha: cfg.ayanamsha,
    },
  };
}

/** Base URL for the match-making controller. */
export function getMatchMakingBaseUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), 'api/v1/astrology/match-making');
}

/** URL with pagination query for match-making history. */
export function getMatchMakingHistoryUrl(page = 1, limit = 10): string {
  const base = getMatchMakingBaseUrl();
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return `${base}?${q.toString()}`;
}

/** URL for the Ashtakoot score endpoint. */
export function getAshtakootScoreUrl(): string {
  return joinUrl(getMatchMakingBaseUrl(), 'ashtakoot-score');
}

/** Paginated history for the authenticated user (GET). */
export async function fetchMatchMakingHistory(
  accessToken: string,
  page = 1,
  limit = 10,
  init?: RequestInit,
): Promise<AstroBackendResult<unknown[]>> {
  const response = await fetch(getMatchMakingHistoryUrl(page, limit), {
    ...init,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
  return readAstroBackendResult<unknown[]>(response, 'match-making API');
}

/** Run Ashtakoot compatibility (POST). */
export async function postAshtakootScore(
  accessToken: string,
  body: CreateMatchMakingInput,
  init?: RequestInit,
): Promise<AstroBackendResult<MatchMakingAshtakootData>> {
  const response = await fetch(getAshtakootScoreUrl(), {
    ...init,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
    body: JSON.stringify(normalizeCreateMatchMakingBody(body)),
  });
  return readAstroBackendResult<MatchMakingAshtakootData>(
    response,
    'match-making API',
  );
}
