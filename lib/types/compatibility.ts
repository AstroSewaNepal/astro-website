/** Backend EAyanamsha */
export const MATCH_AYANAMSHA = ['lahiri', 'sayana'] as const;
export type MatchAyanamsha = (typeof MATCH_AYANAMSHA)[number];

/** Backend EObservationPoints */
export const MATCH_OBSERVATION_POINTS = ['geocentric', 'topocentric'] as const;
export type MatchObservationPoint = (typeof MATCH_OBSERVATION_POINTS)[number];

/** Backend EMatchMakingLanguage */
export const MATCH_LANGUAGE = ['en', 'hi', 'te'] as const;
export type MatchMakingLanguage = (typeof MATCH_LANGUAGE)[number];

export interface MatchMakingParticipantInput {
  fullName: string;
  birthDateTime: string;
  placeOfBirth: string;
  timezone: string;
}

export interface MatchMakingConfigInput {
  observationPoint?: MatchObservationPoint;
  language?: MatchMakingLanguage;
  ayanamsha?: MatchAyanamsha;
}

/** Request body for POST .../ashtakoot-score (CreateMatchMakingDto). */
export interface CreateMatchMakingInput {
  female: MatchMakingParticipantInput;
  male: MatchMakingParticipantInput;
  config?: MatchMakingConfigInput;
}

/**
 * Backend payload for a successful Ashtakoot calculation.
 * Shape varies by API version; narrow in app code as needed.
 */
export interface MatchMakingAshtakootData {
  matchMaking: Record<string, unknown>;
  source?: unknown;
  femaleLocation?: unknown;
  maleLocation?: unknown;
}
