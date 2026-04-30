import type { ResultEnvelope } from '@/lib/types/vedastro';
import { parseVedastroResponse } from '@/lib/utils/vedastro-result';

export type VedastroFetchOptions = RequestInit & {
  /** Optional IANA timezone header (Swagger). Server uses Asia/Kathmandu for ranges by default. */
  timezone?: string;
};

function buildHeaders(init?: VedastroFetchOptions): Headers {
  const h = new Headers(init?.headers);
  if (!h.has('Accept')) {
    h.set('Accept', 'application/json');
  }
  if (init?.timezone) {
    h.set('x-timezone', init.timezone);
  }
  return h;
}

/** GET JSON with Vedastro `Result<T>` parsing. */
export async function vedastroGet<T>(
  url: string,
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<T>> {
  const { timezone, ...rest } = init ?? {};
  const response = await fetch(url, {
    ...rest,
    method: 'GET',
    headers: buildHeaders({ ...rest, timezone }),
  });
  return parseVedastroResponse<T>(response, `GET ${url}`);
}

/** POST JSON with Vedastro `Result<T>` parsing. */
export async function vedastroPost<T, B = unknown>(
  url: string,
  body?: B,
  init?: VedastroFetchOptions,
): Promise<ResultEnvelope<T>> {
  const { timezone, ...rest } = init ?? {};
  const headers = buildHeaders({ ...rest, timezone });
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(url, {
    ...rest,
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parseVedastroResponse<T>(response, `POST ${url}`);
}
