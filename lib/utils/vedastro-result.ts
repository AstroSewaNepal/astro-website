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
 * Thrown messages are shown to visitors, so the request (`GET <url>`) only goes to the console.
 */
export async function parseVedastroResponse<T>(
  response: Response,
  apiLabel: string,
): Promise<ResultEnvelope<T>> {
  let body: ResultEnvelope<T>;
  try {
    body = (await response.json()) as ResultEnvelope<T>;
  } catch {
    console.warn(`Invalid JSON from ${apiLabel}`);
    throw new Error('Something went wrong. Please try again.');
  }

  if (!response.ok) {
    const msg =
      body.errors?.map((e: ApiErrorItem) => e.message).join('; ') ??
      body.message ??
      formatHttpError(response.status, body);
    console.warn(`${apiLabel}: ${msg}`);
    throw new Error(msg);
  }

  if (!body.success) {
    const msg =
      body.errors?.map((e: ApiErrorItem) => e.message).join('; ') ??
      body.message ??
      'Request failed';
    console.warn(`${apiLabel}: ${msg}`);
    throw new Error(msg);
  }

  return body;
}

/** True if HTTP OK and `success` flag is true (data may still be null). */
export function isVedastroOk<T>(body: ResultEnvelope<T>): boolean {
  return body.success === true;
}
