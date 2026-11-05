import { hasAdminRole } from '@/lib/admin-access';

/** Which part of the site an account belongs to. Backend accounts carry one role, like in the app. */
export type AccountKind = 'admin' | 'astrologer' | 'client';

export const ACCOUNT_HOME: Record<AccountKind, string> = {
  admin: '/admin/dashboard',
  astrologer: '/astrologer',
  client: '/client',
};

export function accountKind(roles?: string[] | null): AccountKind | null {
  if (hasAdminRole(roles)) return 'admin';
  if (roles?.includes('ASTROLOGER')) return 'astrologer';
  if (roles?.includes('USER')) return 'client';
  return null;
}

/** Where a logged-in account lands when it opens a page that isn't theirs. */
export function accountHome(roles?: string[] | null): string {
  const kind = accountKind(roles);
  return kind ? ACCOUNT_HOME[kind] : '/';
}

/** Only same-site paths, so `?callbackUrl=` can't send someone to another site after login. */
export function safeReturnPath(path: unknown, fallback: string): string {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return fallback;
  if (path.includes('\\')) return fallback;
  return path;
}

/** Where to go when the session ended on its own: the right sign-in page, then back to the page they were on. */
export function signInAgainPath(here: string): string {
  const path = safeReturnPath(here, '/');
  // Logged out, every /admin page shows the admin login and returns to itself.
  if (path === '/admin' || path.startsWith('/admin/')) return path;
  const params = new URLSearchParams({ callbackUrl: path });
  if (path === '/astrologer' || path.startsWith('/astrologer/')) params.set('role', 'astrologer');
  return `/login?${params.toString()}`;
}
