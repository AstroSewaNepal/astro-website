import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getGhostResource, isGhostResource, type GhostResource } from '@/lib/ghostResources';
import { logger } from '@/lib/logger';

const readStringParams = ['include', 'fields', 'formats'] as const;

const singularResource: Record<GhostResource, string> = {
  posts: 'post',
  pages: 'page',
  authors: 'author',
  tags: 'tag',
};

const buildReadOptions = (searchParams: URLSearchParams) => {
  const options: Record<string, unknown> = {};

  for (const key of readStringParams) {
    const value = searchParams.get(key);
    if (value) {
      options[key] = value;
    }
  }

  return options;
};

const isNotFoundError = (error: unknown) =>
  Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name?: string }).name === 'NotFoundError',
  );

export async function GET(
  request: NextRequest,
  context: { params: { resource: string; id: string } },
) {
  const { resource, id } = context.params;

  if (!isGhostResource(resource)) {
    logger.warn('Unsupported Ghost resource requested by id', { resource, id });
    return NextResponse.json({ error: `Unsupported resource: ${resource}` }, { status: 404 });
  }

  const readOptions = buildReadOptions(request.nextUrl.searchParams);
  const resourceHandler = getGhostResource(resource);
  const singularKey = singularResource[resource];

  try {
    const item = await resourceHandler.read(
      { id },
      Object.keys(readOptions).length > 0 ? readOptions : undefined,
    );

    logger.info('Fetched Ghost resource by id', {
      resource,
      id,
      options: readOptions,
    });

    return NextResponse.json({ [singularKey]: item });
  } catch (error) {
    if (isNotFoundError(error)) {
      logger.warn('Ghost resource not found by id', { resource, id });
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    logger.error('Failed to fetch Ghost resource by id', {
      resource,
      id,
      options: readOptions,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json({ error: 'Failed to fetch Ghost resource' }, { status: 502 });
  }
}
