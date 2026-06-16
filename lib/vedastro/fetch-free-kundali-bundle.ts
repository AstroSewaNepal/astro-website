import type { AllDoshaResult } from '@/lib/vedastro/dosha-types';
import {
  getPublicBackendBaseCandidates,
  resolveFreeKundaliBundleUrl,
} from '@/lib/utils/url';

export interface FreeKundaliBundle {
  panchanga: unknown;
  planetRows: string[][];
  doshas: AllDoshaResult;
}

export async function fetchFreeKundaliBundle(
  query: URLSearchParams,
): Promise<FreeKundaliBundle> {
  const attemptErrors: string[] = [];

  for (const base of getPublicBackendBaseCandidates()) {
    const url = resolveFreeKundaliBundleUrl(base, query);
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
        data?: FreeKundaliBundle;
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

  throw new Error(attemptErrors[attemptErrors.length - 1] ?? 'Failed to generate kundali');
}
