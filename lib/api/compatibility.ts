/**
 * Compatibility:
 * - **Zodiac (Vedastro)** — `POST /api/v1/vedastro/zodiac-compatibility` (public, no JWT in current backend).
 * - **Kundali / Ashtakoot** — `POST /api/v1/astrology/match-making/ashtakoot-score` (JWT) — unchanged below.
 */

import { getVedastroZodiacCompatibilityUrl } from '@/lib/api/vedastro/zodiac-compatibility';
import type { VedastroFetchOptions } from '@/lib/api/vedastro/http';
import type { AstroBackendResult } from '@/lib/types/api';
import type {
  CreateMatchMakingInput,
  MatchMakingAshtakootData,
  MatchMakingConfigInput,
} from '@/lib/types/compatibility';
import type {
  ResultEnvelope,
  ZodiacCompatibilityData,
  ZodiacCompatibilityRequestDto,
} from '@/lib/types/vedastro';
import { readAstroBackendResult } from '@/lib/utils/api';
import { parseVedastroResponse } from '@/lib/utils/vedastro-result';
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

export function getMatchMakingBaseUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), 'astrology/match-making');
}

export function getMatchMakingHistoryUrl(page = 1, limit = 10): string {
  const base = getMatchMakingBaseUrl();
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return `${base}?${q.toString()}`;
}

export function getAshtakootScoreUrl(): string {
  return joinUrl(getMatchMakingBaseUrl(), 'ashtakoot-score');
}

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

/**
 * Vedastro zodiac love compatibility (sun signs + gender), `Result<ZodiacCompatibilityData>`.
 */
export async function postZodiacCompatibility(
  body: ZodiacCompatibilityRequestDto,
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<ZodiacCompatibilityData>> {
  const { timezone, ...rest } = init ?? {};
  const headers = new Headers(rest?.headers);
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
  if (timezone) {
    headers.set('x-timezone', timezone);
  }
  const response = await fetch(getVedastroZodiacCompatibilityUrl(), {
    ...rest,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return parseVedastroResponse<ZodiacCompatibilityData>(
    response,
    'Vedastro zodiac-compatibility',
  );
}
