/** Strip trailing slashes for stable URL joining. */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
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
  const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_URL is not set; required for Astro Sewa API calls',
    );
  }
  return normalizeBaseUrl(base);
}

/**
 * Preferred backend origins for browser fetches.
 * Uses env first and keeps local fallbacks only for development.
 */
export function getPublicBackendBaseCandidates(): string[] {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (configured) {
    return [withTrailingSlash(configured)];
  }

  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:3000/', 'http://localhost:5000/'];
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
