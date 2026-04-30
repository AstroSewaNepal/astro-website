/** Strip trailing slashes for stable URL joining. */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function joinUrl(base: string, path: string): string {
  const b = normalizeBaseUrl(base);
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
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
