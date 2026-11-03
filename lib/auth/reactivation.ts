// An account scheduled for deletion (deleted in the app, 30 days to change their mind) signs in like the app does:
// no session until the person chooses to reactivate. Meanwhile its backend tokens wait, encrypted, in an httpOnly
// cookie that only this server can read; /login/reactivate asks, and the 'reactivated' provider finishes the sign-in.
import { decode, encode } from 'next-auth/jwt';

import { safeReturnPath } from '@/lib/auth/account';
import { isSignUpRole, type SignUpRole } from '@/lib/auth/google-signin';
import { authSecret } from '@/lib/auth/secret';

export type ReactivationHandoff = {
  accessToken: string;
  refreshToken: string;
  role: SignUpRole;
  callbackUrl: string;
};

/** Long enough to read the question, short enough that a forgotten tab doesn't keep live tokens around. */
export const REACTIVATION_MAX_AGE = 10 * 60;

// Its own salt: a session cookie can never be read as a handoff, or the other way round.
const SALT = 'astro-reactivation';

export function reactivationCookie(secure: boolean): string {
  return secure ? '__Host-astro-reactivate' : 'astro-reactivate';
}

export async function sealHandoff(handoff: ReactivationHandoff): Promise<string> {
  if (!authSecret) throw new Error('AUTH_SECRET is not set');
  return encode({ token: handoff, secret: authSecret, salt: SALT, maxAge: REACTIVATION_MAX_AGE });
}

/** The handoff, or null when it is missing, expired, tampered with or sealed with another key. */
export async function openHandoff(sealed: unknown): Promise<ReactivationHandoff | null> {
  if (typeof sealed !== 'string' || !sealed || !authSecret) return null;
  try {
    const token = await decode({ token: sealed, secret: authSecret, salt: SALT });
    if (
      typeof token?.accessToken !== 'string' ||
      typeof token.refreshToken !== 'string' ||
      !isSignUpRole(token.role)
    ) {
      return null;
    }
    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      role: token.role,
      callbackUrl: safeReturnPath(token.callbackUrl, ''),
    };
  } catch {
    return null;
  }
}
