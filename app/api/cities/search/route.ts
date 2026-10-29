import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { publicCacheHeaders } from '@/lib/public-cache';
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

const CITY_API_TIMEZONE = 'Asia/Kathmandu';
// City data rarely changes.
const CACHE_SECONDS = 86400;
const MAX_QUERY_LENGTH = 50;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, MAX_QUERY_LENGTH) ?? '';
  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const backendBase = tryGetPublicBackendBaseUrl();
  if (!backendBase) {
    return NextResponse.json({ message: 'NEXT_PUBLIC_BACKEND_URL is not set' }, { status: 503 });
  }

  const upstreamUrl = `${backendBase}/cities/search?q=${encodeURIComponent(query)}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        // Fixed (the site always sends this) so every visitor shares one cache entry per query.
        'x-timezone': CITY_API_TIMEZONE,
      },
      next: { revalidate: CACHE_SECONDS },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { message: `City search upstream failed (${upstream.status})` },
        { status: upstream.status },
      );
    }

    const body = await upstream.json();
    return NextResponse.json(Array.isArray(body) ? body : [], {
      headers: publicCacheHeaders(CACHE_SECONDS),
    });
  } catch {
    return NextResponse.json({ message: 'City search upstream request failed' }, { status: 502 });
  }
}
