import type {
  ResultEnvelope,
  ZodiacCompatibilityData,
  ZodiacCompatibilityRequestDto,
} from '@/lib/types/vedastro';
import { vedastroPost, type VedastroFetchOptions } from './http';
import { vedastroPath } from './constants';

/** `POST /vedastro/zodiac-compatibility` */
export function getVedastroZodiacCompatibilityUrl(): string {
  return vedastroPath('zodiac-compatibility');
}

export async function postVedastroZodiacCompatibility(
  body: ZodiacCompatibilityRequestDto,
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<ZodiacCompatibilityData>> {
  return vedastroPost<ZodiacCompatibilityData, ZodiacCompatibilityRequestDto>(
    getVedastroZodiacCompatibilityUrl(),
    body,
    init,
  );
}
