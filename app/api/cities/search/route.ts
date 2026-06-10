import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

const CITY_API_TIMEZONE = 'Asia/Kathmandu';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const backendBase = tryGetPublicBackendBaseUrl();
  if (!backendBase) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_BACKEND_URL is not set' },
      { status: 503 },
    );
  }

  const timezone = request.headers.get('x-timezone') ?? CITY_API_TIMEZONE;
  const upstreamUrl = `${backendBase}/cities/search?q=${encodeURIComponent(query)}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-timezone': timezone,
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { message: `City search upstream failed (${upstream.status})` },
        { status: upstream.status },
      );
    }

    const body = await upstream.json();
    return NextResponse.json(Array.isArray(body) ? body : []);
  } catch {
    return NextResponse.json({ message: 'City search upstream request failed' }, { status: 502 });
  }
}
