/** The key next-auth signs and encrypts its cookies with (also the reactivation handoff, lib/auth/reactivation.ts). */
export const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV !== 'production' ? 'local-dev-only-insecure-auth-secret' : undefined);
