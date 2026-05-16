/** Strip trailing slashes for stable URL joining. */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Nest uses global prefix `api/v1`. Accepts either `http://host:port` or
 * `http://host:port/api/v1` in `NEXT_PUBLIC_BACKEND_URL` so all callers match.
 */
export function ensureNestApiRoot(base: string): string {
  const b = normalizeBaseUrl(base.trim());
  return b.endsWith('/api/v1') ? b : `${b}/api/v1`;
}

/** API root including `/api/v1`, or `null` when unset. */
export function tryGetPublicBackendBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (!raw) return null;
  return ensureNestApiRoot(raw);
}

export function joinUrl(base: string, path: string): string {
  const b = normalizeBaseUrl(base);
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

function withTrailingSlash(url: string): string {
  return `${normalizeBaseUrl(url)}/`;
}

/**
 * Client-safe backend origin from env (browser / server with NEXT_PUBLIC_*).
 */
export function getPublicBackendBaseUrl(): string {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_URL is not set; required for Astro Sewa API calls',
    );
  }
  return base;
}

/**
 * Preferred backend origins for browser fetches.
 * Uses env first and keeps local fallbacks only for development.
 */
export function getPublicBackendBaseCandidates(): string[] {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (configured) {
    return [withTrailingSlash(ensureNestApiRoot(configured))];
  }

  if (process.env.NODE_ENV !== 'production') {
    // Prefer Nest default host first (Next does not serve `/api/v1/vedastro/*`).
    return ['http://localhost:5000/', 'http://localhost:3000/'];
  }

  throw new Error('NEXT_PUBLIC_BACKEND_URL is required in production.');
}

/**
 * Full URL for Vedastro proxy routes. {@link getPublicBackendBaseCandidates} may return
 * an origin (`http://host/`) or an API root (`http://host/api/v1/`); this avoids doubling `api/v1`.
 */
export function resolveVedastroProxyFetchUrl(
  baseWithTrailingSlash: string,
  proxyEndpoint: string,
  query: URLSearchParams,
): string {
  const trimmed = normalizeBaseUrl(baseWithTrailingSlash);
  const apiRoot = trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  const ep = proxyEndpoint.replace(/^\/+/, '');
  const qs = query.toString();
  return qs ? `${apiRoot}/vedastro/proxy/${ep}?${qs}` : `${apiRoot}/vedastro/proxy/${ep}`;
}
