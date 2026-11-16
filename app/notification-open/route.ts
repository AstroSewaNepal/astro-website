import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { notificationOpenTarget } from '@/lib/push/open';

// Per login, so never cached.
export const dynamic = 'force-dynamic';

/** A tapped web push (public/push-sw.js): send the person to that notification's page. */
export async function GET(request: Request) {
  const session = await auth();
  const url = new URL(request.url);
  const target = notificationOpenTarget(
    url.searchParams,
    session?.user ? session.user.roles : null,
  );
  return NextResponse.redirect(new URL(target, url.origin), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
