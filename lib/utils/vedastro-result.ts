import type { ApiErrorItem, ResultEnvelope } from '@/lib/types/vedastro';

export function unwrapResult<T>(body: ResultEnvelope<T>): T {
  if (!body.success || body.data == null) {
    const msg =
      body.errors?.map(e => e.message).join('; ') ??
      body.message ??
      'Request failed';
    throw new Error(msg);
  }
  return body.data;
}

function formatHttpError(status: number, body: unknown): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const m = (body as { message?: string }).message;
    if (typeof m === 'string' && m) return m;
  }
  return `HTTP ${status}`;
}

/**
 * Parse JSON as {@link ResultEnvelope}; on non-OK HTTP, throw with server message when present.
 */
export async function parseVedastroResponse<T>(
  response: Response,
  apiLabel: string,
): Promise<ResultEnvelope<T>> {
  let body: ResultEnvelope<T>;
  try {
    body = (await response.json()) as ResultEnvelope<T>;
  } catch {
    throw new Error(`Invalid JSON from ${apiLabel}`);
  }

  if (!response.ok) {
    const msg =
      body.errors?.map((e: ApiErrorItem) => e.message).join('; ') ??
      body.message ??
      formatHttpError(response.status, body);
    throw new Error(`${apiLabel}: ${msg}`);
  }

  if (!body.success) {
    const msg =
      body.errors?.map((e: ApiErrorItem) => e.message).join('; ') ??
      body.message ??
      'Request failed';
    throw new Error(`${apiLabel}: ${msg}`);
  }

  return body;
}

/** True if HTTP OK and `success` flag is true (data may still be null). */
export function isVedastroOk<T>(body: ResultEnvelope<T>): boolean {
  return body.success === true;
}
