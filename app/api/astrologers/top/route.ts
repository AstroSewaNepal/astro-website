import { NextResponse } from 'next/server';

import type {
  Astrologer,
  AstrologerListResponse,
  BackendAstrologerResult,
} from '@/components/pages/landing/talk-to-our-astrologer/types';
import { publicCacheHeaders } from '@/lib/public-cache';
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

const CITY_API_TIMEZONE = 'Asia/Kathmandu';
const UPSTREAM_PATH = '/astrologer-details';
const CACHE_SECONDS = 60;

function buildUpstreamQuery(): URLSearchParams {
  return new URLSearchParams({
    page: '1',
    limit: '10',
    tagMatchMode: 'all',
    isAstrologerActive: 'true',
    sortField: 'averageRating',
    sortOrder: 'desc',
  });
}

function normalizeAstrologerList(payload: unknown): Astrologer[] {
  if (Array.isArray(payload)) return payload as Astrologer[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as AstrologerListResponse;
  const candidates = [record.data, record.astrologers, record.items].find(Array.isArray);
  return (candidates ?? []) as Astrologer[];
}

export async function GET() {
  const backendBase = tryGetPublicBackendBaseUrl();
  if (!backendBase) {
    return NextResponse.json(
      { success: false, data: [], message: 'NEXT_PUBLIC_BACKEND_URL is not set' },
      { status: 503 },
    );
  }

  const query = buildUpstreamQuery();
  const upstreamUrl = `${backendBase}${UPSTREAM_PATH}?${query.toString()}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        // Fixed (the site always sends this) so every visitor shares one cache entry.
        'x-timezone': CITY_API_TIMEZONE,
      },
      next: { revalidate: CACHE_SECONDS },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, data: [], message: `Upstream failed (${upstream.status})` },
        { status: upstream.status },
      );
    }

    const body = (await upstream.json()) as BackendAstrologerResult<
      Astrologer[] | AstrologerListResponse
    >;
    const astrologers = normalizeAstrologerList(body.data ?? body);

    return NextResponse.json(
      {
        success: body.success ?? true,
        data: astrologers,
      },
      { headers: publicCacheHeaders(CACHE_SECONDS) },
    );
  } catch {
    return NextResponse.json(
      { success: false, data: [], message: 'Upstream request failed' },
      { status: 502 },
    );
  }
}
