import type { Session } from 'next-auth';

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export function hasAdminRole(roles?: string[] | null): boolean {
  return (roles ?? []).some(role => ADMIN_ROLES.includes(role));
}

// Every /admin page and /api/admin route must check this, not just "logged in":
// once clients can sign in on the website, a session alone proves nothing.
export function isAdminSession(session?: Session | null): boolean {
  return !!session?.user && hasAdminRole(session.user.roles);
}
