import { NextResponse } from 'next/server';

import { countryFromHeaders } from '@/lib/geo/country';

// Per visitor, so never cached by the site or a CDN. The browser asks at most every 30 minutes (hooks/use-buyer-country).
export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return NextResponse.json(
    { countryCode: countryFromHeaders(request.headers) },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
