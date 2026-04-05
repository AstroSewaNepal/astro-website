import type { AstroBackendResult } from '@/lib/types/api';

/** Parse backend {@link AstroBackendResult} envelope and throw on HTTP error. */
export async function readAstroBackendResult<T>(
  response: Response,
  apiLabel: string,
): Promise<AstroBackendResult<T>> {
  let body: AstroBackendResult<T>;
  try {
    body = (await response.json()) as AstroBackendResult<T>;
  } catch {
    throw new Error(`Invalid JSON from ${apiLabel}`);
  }
  if (!response.ok) {
    const msg =
      body.message ??
      body.errors?.[0]?.message ??
      `${apiLabel} failed (${response.status})`;
    throw new Error(msg);
  }
  return body;
}

/**
 * Parse a plain JSON body (not wrapped in Result) and throw on HTTP error.
 */
export async function readJsonOk<T>(
  response: Response,
  apiLabel: string,
): Promise<T> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid JSON from ${apiLabel}`);
  }
  if (!response.ok) {
    const msg =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `${apiLabel} failed (${response.status})`;
    throw new Error(msg);
  }
  return body as T;
}
