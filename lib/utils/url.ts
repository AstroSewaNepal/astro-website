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
