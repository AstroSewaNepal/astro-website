import { AuthError } from 'next-auth';

// On Cloudflare the server bundle can hold two copies of next-auth's error classes, so instanceof alone misses
// them; every Auth.js error also carries a string `type` (Next's redirect errors don't).
export const isAuthError = (e: unknown) =>
  e instanceof AuthError || (e instanceof Error && typeof (e as { type?: unknown }).type === 'string');
