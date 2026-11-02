import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getGhostResource, isGhostResource, type GhostResource } from '@/lib/ghostResources';
import { logger } from '@/lib/logger';
import { publicCacheHeaders } from '@/lib/public-cache';

// New and edited posts show up within 5 minutes.
const CACHE_SECONDS = 300;

const stringParams = ['filter', 'include', 'formats', 'fields', 'order'] as const;

const buildBrowseOptions = (searchParams: URLSearchParams) => {
  const options: Record<string, unknown> = {};

  for (const key of stringParams) {
    const value = searchParams.get(key);
    if (value) {
      options[key] = value;
    }
  }

  const limitParam = searchParams.get('limit');
  if (limitParam) {
    if (limitParam === 'all') {
      options.limit = 'all';
    } else {
      const parsedLimit = Number.parseInt(limitParam, 10);
      if (!Number.isNaN(parsedLimit)) {
        options.limit = parsedLimit;
      }
    }
  }

  const pageParam = searchParams.get('page');
  if (pageParam) {
    const parsedPage = Number.parseInt(pageParam, 10);
    if (!Number.isNaN(parsedPage)) {
      options.page = parsedPage;
    }
  }

  return options;
};

const makeResponseBody = (resource: GhostResource, items: unknown[]): Record<string, unknown> => {
  const clonedItems = [...items];
  const meta = (items as Array<unknown> & { meta?: unknown }).meta;

  return meta
    ? {
        [resource]: clonedItems,
        meta,
      }
    : {
        [resource]: clonedItems,
      };
};

// Ghost only computes reading_time when html is fetched. Lists ask for reading_time without html, so fetch
// html here and drop it from the reply (all posts: 2.2 MB -> 80 KB). Ghost's own reply is cached by ghostClient.
const browse = async (resource: GhostResource, options: Record<string, unknown>) => {
  const fields = typeof options.fields === 'string' ? options.fields.split(',') : [];
  const dropHtml = fields.includes('reading_time') && !fields.includes('html');
  const results = await getGhostResource(resource).browse(
    dropHtml ? { ...options, fields: [...fields, 'html'].join(',') } : options,
  );
  if (dropHtml) {
    for (const item of results as Array<{ html?: unknown }>) delete item.html;
  }
  return makeResponseBody(resource, results);
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const { resource } = await context.params;

  if (!isGhostResource(resource)) {
    logger.warn('Unsupported Ghost resource requested', { resource });
    return NextResponse.json({ error: `Unsupported resource: ${resource}` }, { status: 404 });
  }

  const browseOptions = buildBrowseOptions(request.nextUrl.searchParams);

  try {
    const responseBody = await browse(resource, browseOptions);
    const results = responseBody[resource] as unknown[];

    logger.info('Fetched Ghost resource collection', {
      resource,
      count: Array.isArray(results) ? results.length : 0,
      options: browseOptions,
    });

    return NextResponse.json(responseBody, { headers: publicCacheHeaders(CACHE_SECONDS) });
  } catch (error) {
    logger.error('Failed to fetch Ghost resource collection', {
      resource,
      options: browseOptions,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      { error: 'Failed to fetch Ghost resource collection' },
      { status: 502 },
    );
  }
}
