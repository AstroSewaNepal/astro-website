// Browser client for per-user backend data (bookings, chat, wallet...). It calls the backend directly: routing these
// through the website can't be cached and would only add a Worker request per call (01-project-setup.md).
// Public, same-for-everyone data goes through cached website routes instead (/api/astrologers/top, /api/ghost/*).

export type Pagination = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

/** The backend's response envelope (`Result` in the backend). */
type Envelope<T> = {
  success?: boolean;
  data?: T | null;
  message?: string;
  pagination?: Pagination;
  errors?: { statusCode?: number; message?: string }[];
};

export type BackendResult<T> = { data: T; pagination?: Pagination; message?: string };

export class BackendError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Envelope<unknown>['errors'] = [],
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

export type BackendClientDeps = {
  /** API root including /api/v1. */
  baseUrl: string;
  /** Token for the next request, or null when logged out (public endpoints still work). */
  getToken: () => Promise<string | null>;
  /** New token after `failedToken` got a 401; null when the user must log in again. */
  refreshToken: (failedToken: string) => Promise<string | null>;
  /** Called once when the session can't be refreshed. */
  onAuthLost: () => void;
  timeZone?: string;
  fetchImpl?: typeof fetch;
};

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function createBackendClient({
  baseUrl,
  getToken,
  refreshToken,
  onAuthLost,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  fetchImpl = (...args) => fetch(...args),
}: BackendClientDeps) {
  const root = baseUrl.replace(/\/+$/, '');

  const send = (method: Method, path: string, token: string | null, body?: unknown) => {
    const headers: Record<string, string> = { accept: 'application/json', 'x-timezone': timeZone };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined && !(body instanceof FormData))
      headers['Content-Type'] = 'application/json';
    return fetchImpl(`${root}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  };

  async function request<T>(
    method: Method,
    path: string,
    body?: unknown,
  ): Promise<BackendResult<T>> {
    const token = await getToken();
    let res = await send(method, path, token, body);

    // One retry with a refreshed token. A 401 alone never logs the user out (the app's "401 -> wipe tokens" chain
    // logged people out on unrelated 401s); only a refused refresh does.
    if (res.status === 401 && token) {
      const next = await refreshToken(token);
      if (!next) {
        onAuthLost();
      } else if (next !== token) {
        res = await send(method, path, next, body);
      }
    }

    const json = (await res.json().catch(() => null)) as Envelope<T> | null;
    if (!res.ok || json?.success === false) {
      const message =
        json?.errors?.[0]?.message ?? json?.message ?? `Request failed (${res.status})`;
      throw new BackendError(message, res.status, json?.errors);
    }
    return {
      data: (json?.data ?? null) as T,
      pagination: json?.pagination,
      message: json?.message,
    };
  }

  return {
    request,
    get: async <T>(path: string) => (await request<T>('GET', path)).data,
    post: async <T>(path: string, body?: unknown) =>
      (await request<T>('POST', path, body ?? {})).data,
    put: async <T>(path: string, body?: unknown) =>
      (await request<T>('PUT', path, body ?? {})).data,
    patch: async <T>(path: string, body?: unknown) =>
      (await request<T>('PATCH', path, body ?? {})).data,
    delete: async <T>(path: string, body?: unknown) => (await request<T>('DELETE', path, body)).data,
  };
}

export type BackendClient = ReturnType<typeof createBackendClient>;
