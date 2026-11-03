import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { signIn } from '@/auth';
import { revokeBackendSession } from '@/lib/auth/backend-tokens';
import { signInErrorCode } from '@/lib/auth/google-signin';
import { openHandoff, reactivationCookie } from '@/lib/auth/reactivation';

/**
 * The answer to "reactivate your account?" (a form post from /login/reactivate). Reactivate: the 'reactivated'
 * provider cancels the deletion and signs in. Sign out: the waiting backend session is ended.
 */
export async function POST(request: NextRequest) {
  const secure = request.nextUrl.protocol === 'https:';
  const cookieName = reactivationCookie(secure);
  const sealed = request.cookies.get(cookieName)?.value;
  const handoff = await openHandoff(sealed);

  // Used once, whatever the answer.
  const jar = await cookies();
  jar.set(cookieName, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax', secure });

  if (!handoff) return redirect('/login?error=signin_expired');
  const form = await request.formData().catch(() => null);
  if (form?.get('choice') !== 'reactivate') {
    await revokeBackendSession(handoff.refreshToken);
    return redirect('/');
  }
  try {
    await signIn('reactivated', { handoff: sealed, redirect: false });
  } catch (error) {
    await revokeBackendSession(handoff.refreshToken);
    const params = new URLSearchParams({ error: signInErrorCode(error) });
    if (handoff.role === 'ASTROLOGER') params.set('role', 'astrologer');
    return redirect(`/login?${params.toString()}`);
  }
  return redirect(handoff.callbackUrl || '/start');
}

// Relative Location, like /start: no dependence on the host the request came through.
function redirect(location: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: location, 'Cache-Control': 'private, no-store' },
  });
}
