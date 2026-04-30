import { getPublicBackendBaseUrl, joinUrl } from '@/lib/utils/url';

/** Path segment after origin (no leading slash). */
export const VEDASTRO_API_PREFIX = 'api/v1/vedastro';

export function getVedastroBaseUrl(): string {
  return joinUrl(getPublicBackendBaseUrl(), VEDASTRO_API_PREFIX);
}

export function vedastroPath(...segments: string[]): string {
  return joinUrl(getVedastroBaseUrl(), segments.join('/'));
}
