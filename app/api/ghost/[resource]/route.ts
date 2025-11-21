import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getGhostResource, isGhostResource, type GhostResource } from '@/lib/ghostResources';
import { logger } from '@/lib/logger';

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

export async function GET(request: NextRequest, context: { params: { resource: string } }) {
  const { resource } = context.params;

  if (!isGhostResource(resource)) {
    logger.warn('Unsupported Ghost resource requested', { resource });
    return NextResponse.json({ error: `Unsupported resource: ${resource}` }, { status: 404 });
  }

  const browseOptions = buildBrowseOptions(request.nextUrl.searchParams);
  const resourceHandler = getGhostResource(resource);

  try {
    const results = await resourceHandler.browse(browseOptions);
    const responseBody = makeResponseBody(resource, results);

    logger.info('Fetched Ghost resource collection', {
      resource,
      count: Array.isArray(results) ? results.length : 0,
      options: browseOptions,
    });

    return NextResponse.json(responseBody);
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
