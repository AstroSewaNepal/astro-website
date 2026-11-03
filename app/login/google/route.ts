import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { signIn } from '@/auth';
import {
  decodePendingSignIn,
  type PendingGoogleSignIn,
  pendingSignInCookie,
  sameState,
  type SignInError,
  signInErrorCode,
  signInErrorHandoff,
} from '@/lib/auth/google-signin';
import { REACTIVATION_MAX_AGE, reactivationCookie } from '@/lib/auth/reactivation';

/**
 * Where the backend's Google callback sends the browser, with Google's one-time code. A route, not a page, so no
 * analytics or page script ever sees the code. Signs in only when the state matches the one this browser started with.
 */
export async function GET(request: NextRequest) {
  const secure = request.nextUrl.protocol === 'https:';
  const cookieName = pendingSignInCookie(secure);
  const pending = decodePendingSignIn(request.cookies.get(cookieName)?.value);
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  // One attempt per started sign-in: a reload or a replayed link starts over.
  const jar = await cookies();
  jar.set(cookieName, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax', secure });

  if (!pending || !code || !sameState(pending.state, state)) {
    return redirect(loginError('signin_expired', pending));
  }
  try {
    await signIn('google-code', {
      code,
      role: pending.role,
      returnTo: pending.callbackUrl,
      redirect: false,
    });
  } catch (error) {
    // An account scheduled for deletion gets the app's "reactivate?" question before any session exists.
    const handoff = signInErrorHandoff(error);
    if (handoff) {
      jar.set(reactivationCookie(secure), handoff, {
        path: '/',
        maxAge: REACTIVATION_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax',
        secure,
      });
      return redirect('/login/reactivate');
    }
    // Fail closed: anything that went wrong is a failed sign-in, never a half-made session.
    return redirect(loginError(signInErrorCode(error), pending));
  }
  // /start sends the account to its own home when the sign-in didn't come from a page.
  return redirect(pending.callbackUrl || '/start');
}

/** Back to the Sign in page with the reason, on the tab and with the return path the person started with. */
function loginError(error: SignInError, pending: PendingGoogleSignIn | null): string {
  const params = new URLSearchParams({ error });
  if (pending?.role === 'ASTROLOGER') params.set('role', 'astrologer');
  if (pending?.callbackUrl) params.set('callbackUrl', pending.callbackUrl);
  return `/login?${params.toString()}`;
}

// Relative Location, like /start: no dependence on the host the request came through.
function redirect(location: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: location, 'Cache-Control': 'private, no-store' },
  });
}
