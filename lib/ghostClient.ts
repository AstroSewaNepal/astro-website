import GhostContentAPI from '@tryghost/content-api';

import { env } from './env';
import { logger } from './logger';

const normalizeBaseUrl = (url: string): string =>
  url.endsWith('/') ? url.slice(0, -1) : url;

const ghostClient = new GhostContentAPI({
  url: normalizeBaseUrl(env.ghostContentApiUrl),
  key: env.ghostContentApiKey,
  version: env.ghostContentApiVersion,
});

logger.debug('Initialized Ghost Content API client', {
  url: env.ghostContentApiUrl,
  version: env.ghostContentApiVersion,
});

export { ghostClient };
