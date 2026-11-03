import type { NextRequest } from 'next/server';

import { safeReturnPath } from '@/lib/auth/account';
import {
  encodePendingSignIn,
  isSignUpRole,
  newState,
  PENDING_SIGN_IN_MAX_AGE,
  pendingSignInCookie,
} from '@/lib/auth/google-signin';
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

/**
 * "Continue with Google" (a form post from the Sign in page). Remembers a random state with the chosen role in an
 * httpOnly cookie, then sends the browser to Google through the backend. /login/google checks the state on the way back.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const role = form?.get('role');
  const apiRoot = tryGetPublicBackendBaseUrl();
  if (!apiRoot || !isSignUpRole(role)) return redirect('/login?error=google_failed');

  const state = newState();
  const google = new URL(`${apiRoot}/auth/google/url`);
  google.searchParams.set('deviceType', 'WEB');
  google.searchParams.set('state', state);

  const secure = request.nextUrl.protocol === 'https:';
  const cookie = [
    `${pendingSignInCookie(secure)}=${encodePendingSignIn({
      state,
      role,
      callbackUrl: safeReturnPath(form?.get('callbackUrl'), ''),
    })}`,
    'Path=/',
    `Max-Age=${PENDING_SIGN_IN_MAX_AGE}`,
    'HttpOnly',
    // Lax: the cookie still comes along on Google's (top-level GET) way back.
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
  ].join('; ');
  return redirect(google.toString(), cookie);
}

function redirect(location: string, cookie?: string): Response {
  const headers = new Headers({ Location: location, 'Cache-Control': 'private, no-store' });
  if (cookie) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
}
