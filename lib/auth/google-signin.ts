// Website Google sign-in. The browser goes: Sign in page → POST /login/google/start (sets the state cookie) → backend
// /auth/google/url → Google → backend /auth/google/callback → GET /login/google?code&state (checks the cookie) →
// the next-auth 'google-code' provider, which exchanges the one-time code at POST /auth/google with the chosen role.
import { safeReturnPath } from '@/lib/auth/account';

/** Roles a person can sign up with, as the backend names them. */
export type SignUpRole = 'USER' | 'ASTROLOGER';

export const SIGN_UP_ROLES: readonly SignUpRole[] = ['USER', 'ASTROLOGER'];

export function isSignUpRole(value: unknown): value is SignUpRole {
  return SIGN_UP_ROLES.includes(value as SignUpRole);
}

/** What the start route remembers until Google sends the person back. */
export type PendingGoogleSignIn = { state: string; role: SignUpRole; callbackUrl: string };

/** Google sign-ins that take longer than this start over. */
export const PENDING_SIGN_IN_MAX_AGE = 10 * 60;

/** On https the `__Host-` prefix means only this exact host can set the cookie, so a subdomain can't plant a state. */
export function pendingSignInCookie(secure: boolean): string {
  return secure ? '__Host-astro-google-signin' : 'astro-google-signin';
}

export function newState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64url');
}

export function encodePendingSignIn(pending: PendingGoogleSignIn): string {
  return Buffer.from(JSON.stringify(pending)).toString('base64url');
}

export function decodePendingSignIn(value: string | undefined): PendingGoogleSignIn | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<PendingGoogleSignIn>;
    if (typeof parsed.state !== 'string' || parsed.state.length < 32 || !isSignUpRole(parsed.role)) return null;
    return { state: parsed.state, role: parsed.role, callbackUrl: safeReturnPath(parsed.callbackUrl, '') };
  } catch {
    return null;
  }
}

/** Compares the returned state with the remembered one without leaking how much of it matched. */
export function sameState(remembered: string, returned: unknown): boolean {
  if (typeof returned !== 'string' || returned.length !== remembered.length) return false;
  let diff = 0;
  for (let i = 0; i < remembered.length; i++) diff |= remembered.charCodeAt(i) ^ returned.charCodeAt(i);
  return diff === 0;
}

/** Why a sign-in failed, as `/login?error=` carries it. The first two come from the backend's Google callback. */
export const SIGN_IN_ERRORS = [
  'google_cancelled',
  'google_failed',
  'signin_expired',
  'role_mismatch',
  'suspended',
  'admin_account',
  'pending_deletion',
] as const;

export type SignInError = (typeof SIGN_IN_ERRORS)[number];

export function isSignInError(value: unknown): value is SignInError {
  return SIGN_IN_ERRORS.includes(value as SignInError);
}

/**
 * The error a sign-in provider threw. next-auth rethrows it, but a second copy of next-auth in the Cloudflare bundle
 * can wrap it (CallbackRouteError keeps it as `cause.err`), so look one level down too.
 */
function providerError(error: unknown): { code: SignInError; handoff?: unknown } | null {
  let current: unknown = error;
  for (let depth = 0; depth < 3 && current && typeof current === 'object'; depth++) {
    const code = (current as { code?: unknown }).code;
    if (isSignInError(code)) return current as { code: SignInError; handoff?: unknown };
    const cause = (current as { cause?: unknown }).cause;
    current = cause && typeof cause === 'object' && 'err' in cause ? (cause as { err: unknown }).err : cause;
  }
  return null;
}

/** Why the sign-in failed; anything unexpected is a plain failure. */
export function signInErrorCode(error: unknown): SignInError {
  return providerError(error)?.code ?? 'google_failed';
}

/** For 'pending_deletion': the sealed tokens to keep until the person decides (lib/auth/reactivation.ts). */
export function signInErrorHandoff(error: unknown): string | null {
  const found = providerError(error);
  return found?.code === 'pending_deletion' && typeof found.handoff === 'string' ? found.handoff : null;
}

/** What the Sign in page shows for each error; the texts follow the app's. */
export function signInErrorMessage(error: SignInError, role: 'client' | 'astrologer'): string {
  switch (error) {
    case 'google_cancelled':
      return 'Google sign-in was cancelled.';
    case 'signin_expired':
      return 'That sign-in took too long or was started in another window. Please try again.';
    case 'role_mismatch': {
      const tried = role === 'client' ? 'Client' : 'Astrologer';
      const other = role === 'client' ? 'an Astrologer' : 'a Client';
      const otherTab = role === 'client' ? 'Astrologer' : 'Client';
      return `You tried to log in as "${tried}" and we could not verify your account. If you have previously registered as ${other}, try selecting the "${otherTab}" tab instead.`;
    }
    case 'suspended':
      return 'Your account has been suspended for violating our Terms of Use. Contact support@astrosewa.com if you think this is a mistake.';
    case 'admin_account':
      return 'Admin accounts cannot sign in as a client or astrologer.';
    case 'pending_deletion':
      return 'Your account is scheduled for permanent deletion. Sign in again to reactivate it.';
    case 'google_failed':
      return 'We could not log you in. Please try again.';
  }
}
