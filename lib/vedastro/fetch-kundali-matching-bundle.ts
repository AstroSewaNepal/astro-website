import type { AllDoshaResult } from '@/lib/vedastro/dosha-types';
import type { FreeKundaliBundle } from '@/lib/vedastro/fetch-free-kundali-bundle';
import {
  getPublicBackendBaseCandidates,
  resolveKundaliMatchingBundleUrl,
} from '@/lib/utils/url';

export type MatchReportPayload = {
  KutaScore?: number;
  Notes?: string;
  Summary?: {
    HeartIcon?: string;
    ScoreColor?: string;
    ScoreSummary?: string;
  };
  PredictionList?: Array<{
    Name?: string;
    Nature?: string;
    Info?: string;
    Description?: string;
    MaleInfo?: string;
    FemaleInfo?: string;
    Score?: number;
  }>;
};

export interface KundaliMatchingBundle {
  matchReport: MatchReportPayload;
  man: FreeKundaliBundle;
  woman: FreeKundaliBundle;
  manChartSvg: string;
  womanChartSvg: string;
}

export type KundaliMatchingBundleQuery = {
  manLat: string;
  manLon: string;
  manDate: string;
  manTime: string;
  manOffset: string;
  manLocation?: string;
  manName?: string;
  manGender: string;
  womanLat: string;
  womanLon: string;
  womanDate: string;
  womanTime: string;
  womanOffset: string;
  womanLocation?: string;
  womanName?: string;
  womanGender: string;
};

export async function fetchKundaliMatchingBundle(
  query: KundaliMatchingBundleQuery,
): Promise<KundaliMatchingBundle> {
  const params = new URLSearchParams(query);
  const attemptErrors: string[] = [];

  for (const base of getPublicBackendBaseCandidates()) {
    const url = resolveKundaliMatchingBundleUrl(base, params);
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const preview = text.slice(0, 120).replace(/\s+/g, ' ').trim();
        attemptErrors.push(
          `Non-JSON from ${url} (${response.status}): ${preview || 'empty'}`,
        );
        continue;
      }

      const json = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: KundaliMatchingBundle;
        errors?: Array<{ message?: string }>;
      };

      if (!response.ok || json.success === false || !json.data) {
        const msg =
          json.message ||
          json.errors?.[0]?.message ||
          `Request failed (${response.status})`;
        attemptErrors.push(msg);
        continue;
      }

      return json.data;
    } catch (error) {
      attemptErrors.push(
        error instanceof Error ? error.message : 'Network error',
      );
    }
  }

  throw new Error(
    attemptErrors[attemptErrors.length - 1] ?? 'Failed to generate kundali matching',
  );
}

/** Stored on session after form submit (same pattern as free kundali). */
export type StoredKundaliMatchingResult = {
  man: {
    fullName: string;
    dateOfBirth: string;
    birthTime: string;
    birthPlace: string;
    gender: string;
    latitude: string;
    longitude: string;
  };
  woman: {
    fullName: string;
    dateOfBirth: string;
    birthTime: string;
    birthPlace: string;
    gender: string;
    latitude: string;
    longitude: string;
  };
  matchReport: MatchReportPayload;
  manPayload: { calculator: string; payload: unknown };
  womanPayload: { calculator: string; payload: unknown };
  manPlanetRows: string[][];
  womanPlanetRows: string[][];
  manDoshas: AllDoshaResult;
  womanDoshas: AllDoshaResult;
  manLagnaSvg: string;
  womanLagnaSvg: string;
};

export function bundleToStoredResult(
  man: StoredKundaliMatchingResult['man'],
  woman: StoredKundaliMatchingResult['woman'],
  bundle: KundaliMatchingBundle,
): StoredKundaliMatchingResult {
  return {
    man,
    woman,
    matchReport: bundle.matchReport,
    manPayload: { calculator: 'AllTimeData', payload: bundle.man.panchanga },
    womanPayload: { calculator: 'AllTimeData', payload: bundle.woman.panchanga },
    manPlanetRows: bundle.man.planetRows,
    womanPlanetRows: bundle.woman.planetRows,
    manDoshas: bundle.man.doshas,
    womanDoshas: bundle.woman.doshas,
    manLagnaSvg: bundle.manChartSvg,
    womanLagnaSvg: bundle.womanChartSvg,
  };
}
