import GhostContentAPI from '@tryghost/content-api';

import { env } from './env';
import { logger } from './logger';

const normalizeBaseUrl = (url: string): string => (url.endsWith('/') ? url.slice(0, -1) : url);

// New and edited posts show up within 5 minutes.
const GHOST_CACHE_SECONDS = 300;

type GhostRequest = {
  url: string;
  params: Record<string, unknown>;
  headers: Record<string, string>;
};

// The client's default axios transport skips Next's data cache. With fetch, Ghost responses are cached
// (KV on Cloudflare, where Worker responses aren't CDN-cached), so /api/ghost/* calls from every visitor
// don't each reach Ghost. Errors keep axios's `response.data` shape, which the client maps to NotFoundError etc.
const makeRequest = async ({ url, params, headers }: GhostRequest) => {
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(([] as unknown[]).concat(v).join(','))}`)
    .join('&');
  const res = await fetch(`${url}?${query}`, {
    headers,
    next: { revalidate: GHOST_CACHE_SECONDS },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw Object.assign(new Error(`Ghost request failed (${res.status})`), {
      response: { status: res.status, data },
    });
  }
  return { data };
};

const ghostClient = new GhostContentAPI({
  url: normalizeBaseUrl(env.ghostContentApiUrl),
  key: env.ghostContentApiKey,
  version: env.ghostContentApiVersion,
  makeRequest,
});

logger.debug('Initialized Ghost Content API client', {
  url: env.ghostContentApiUrl,
  version: env.ghostContentApiVersion,
});

export { ghostClient };
