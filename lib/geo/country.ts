// The buyer's country for prices (backend resolvePrice: NP -> NPR, IN -> INR in NPR, others -> USD, none -> the
// backend's PRICING_UNKNOWN_COUNTRY_CURRENCY). The app reads GPS; the website uses the host's IP country instead
// (decided 2026-11-05: no permission popup, wrong only behind a VPN).

/** Codes the hosts send when they don't know the country: XX unknown, T1 Tor; EU/AP are regions, not countries. */
const NOT_A_COUNTRY = new Set(['XX', 'T1', 'EU', 'AP']);

/** An ISO 3166-1 alpha-2 code in capitals, or null. */
export function normalizeCountryCode(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code) || NOT_A_COUNTRY.has(code)) return null;
  return code;
}

/**
 * The visitor's country from the host's own header. Each host overwrites its header, but passes the other host's
 * through untouched, so only the current host's header is read.
 */
export function countryFromHeaders(
  headers: Headers,
  onVercel = Boolean(process.env.VERCEL),
): string | null {
  return normalizeCountryCode(headers.get(onVercel ? 'x-vercel-ip-country' : 'cf-ipcountry'));
}

/** Where the browser keeps the last country it was given (it survives log out, like the app's MMKV cache). */
export const COUNTRY_STORAGE_KEY = 'astrosewa.country';

/** The app re-checks a known country at most every 30 minutes; an unknown one after 30 seconds. */
export const KNOWN_COUNTRY_RECHECK_MS = 30 * 60 * 1000;
export const UNKNOWN_COUNTRY_RECHECK_MS = 30 * 1000;

export type StoredCountry = { countryCode: string; checkedAt: number };

export function parseStoredCountry(raw: string | null): StoredCountry | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredCountry>;
    const countryCode = normalizeCountryCode(value.countryCode);
    if (!countryCode || typeof value.checkedAt !== 'number') return null;
    return { countryCode, checkedAt: value.checkedAt };
  } catch {
    return null;
  }
}
