import { auth } from '@/auth';
import { accountHome } from '@/lib/auth/account';

/**
 * Home-screen icon entry (manifest start_url): logged-in accounts land on their own home, others on the site.
 * A route, not a page: a page redirect under the site layout streams as a 1 s meta refresh.
 */
export async function GET() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // invalid / expired JWT: treat as logged out
  }
  const target = session?.user ? accountHome(session.user.roles) : '/';
  // Relative Location: no dependence on the host the request came through (Cloudflare, Vercel, localhost)
  return new Response(null, {
    status: 307,
    headers: { Location: target, 'Cache-Control': 'private, no-store' },
  });
}
