import type {
  ResultEnvelope,
  SeedZodiacSignData,
  VedastroZodiacSignRow,
} from '@/lib/types/vedastro';
import { vedastroGet, vedastroPost, type VedastroFetchOptions } from './http';
import { vedastroPath } from './constants';

/** `GET /vedastro/zodiac-sign` */
export function getVedastroZodiacSignListUrl(): string {
  return vedastroPath('zodiac-sign');
}

/** `GET /vedastro/zodiac-sign/:slug` */
export function getVedastroZodiacSignBySlugUrl(slug: string): string {
  return vedastroPath('zodiac-sign', slug);
}

/** `POST /vedastro/zodiac-sign/seed-once` */
export function getVedastroZodiacSeedOnceUrl(force?: boolean): string {
  const url = new URL(vedastroPath('zodiac-sign', 'seed-once'));
  if (force !== undefined) {
    url.searchParams.set('force', String(force));
  }
  return url.toString();
}

export async function fetchVedastroZodiacSignList(
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<VedastroZodiacSignRow[]>> {
  return vedastroGet<VedastroZodiacSignRow[]>(getVedastroZodiacSignListUrl(), init);
}

export async function fetchVedastroZodiacSignBySlug(
  slug: string,
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<VedastroZodiacSignRow>> {
  return vedastroGet<VedastroZodiacSignRow>(
    getVedastroZodiacSignBySlugUrl(slug),
    init,
  );
}

export async function postVedastroZodiacSeedOnce(
  force = false,
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<SeedZodiacSignData>> {
  return vedastroPost<SeedZodiacSignData, Record<string, never>>(
    getVedastroZodiacSeedOnceUrl(force),
    {},
    init,
  );
}
