import type { AllDoshaResult } from '@/lib/vedastro/dosha-types';

/** What the free kundali result page draws: left in sessionStorage by the form, or built from a saved report. */
export type StoredKundaliResult = {
  fullName: string;
  birthPlace: string;
  dateOfBirth: string;
  birthTime: string;
  gender?: string;
  latitude?: string;
  longitude?: string;
  payload: unknown;
  /** Cached sidereal planet table rows (from VedAstro AllPlanetData). */
  planetRows?: string[][];
  /** Seven-dosha engine output from GET /vedastro/dosha. */
  doshas?: AllDoshaResult;
  /** Set when it is (also) saved in the client's Astro Reports. */
  savedId?: string;
};
