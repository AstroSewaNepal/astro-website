import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { hasAdminRole } from '@/lib/admin-access';
import { getJwtExpiry, refreshBackendTokens, revokeBackendSession } from '@/lib/auth/backend-tokens';
import { isSignUpRole, type SignInError } from '@/lib/auth/google-signin';
import { openHandoff, sealHandoff } from '@/lib/auth/reactivation';
import { authSecret } from '@/lib/auth/secret';
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

/** A failed Google sign-in; `code` is the reason /login/google shows (see signInErrorCode). */
class GoogleSignInError extends CredentialsSignin {
  /** Sealed tokens of an account pending deletion (never put tokens in `cause`: next-auth logs it). */
  handoff?: string;

  constructor(reason: SignInError, handoff?: string) {
    super(reason);
    this.code = reason;
    this.handoff = handoff;
  }
}

type BackendAuthUser = {
  _id: string;
  email: string;
  fullName?: string;
  profilePicture?: { url: string };
  roles?: string[];
  isPendingDeletion?: boolean;
};

function sessionUser(user: BackendAuthUser, accessToken: string, refreshToken: string) {
  return {
    id: user._id,
    name: user.fullName || user.email,
    email: user.email,
    image: user.profilePicture?.url ?? null,
    backendAccessToken: accessToken,
    backendRefreshToken: refreshToken,
    roles: user.roles ?? [],
  };
}

const providers = [
  // Google (doc 03): /login/google calls signIn('google-code') with Google's one-time code once the state matched;
  // the backend exchanges it and finds or creates the account with the role picked on the Sign in page. Only a code
  // is accepted, never tokens, since this callback is a public endpoint.
  Credentials({
    id: 'google-code',
    name: 'Google',
    credentials: { code: {}, role: {}, returnTo: {} },
    async authorize(credentials) {
      const apiRoot = tryGetPublicBackendBaseUrl();
      const { code, role, returnTo } = credentials ?? {};
      if (!apiRoot || typeof code !== 'string' || !code || !isSignUpRole(role)) {
        throw new GoogleSignInError('google_failed');
      }

      let res: Response;
      try {
        res = await fetch(`${apiRoot}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, role, deviceType: 'WEB' }),
          cache: 'no-store',
        });
      } catch {
        throw new GoogleSignInError('google_failed');
      }
      // Like the app: 403 is only ever a suspended account; 401 is mostly an account made with the other role.
      if (res.status === 403) throw new GoogleSignInError('suspended');
      if (res.status === 401) throw new GoogleSignInError('role_mismatch');
      const json = res.ok ? await res.json().catch(() => null) : null;
      const data = json?.success ? json.data : null;
      if (!data?.accessToken || !data.refreshToken || !data.user?._id) {
        throw new GoogleSignInError('google_failed');
      }

      const user = data.user as BackendAuthUser;
      // The backend lets admin accounts through any role; on the website they use the admin login only.
      if (hasAdminRole(user.roles)) {
        await revokeBackendSession(data.refreshToken);
        throw new GoogleSignInError('admin_account');
      }
      // Like the app: no session for an account scheduled for deletion until the person reactivates it.
      if (user.isPendingDeletion) {
        const handoff = await sealHandoff({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role,
          callbackUrl: typeof returnTo === 'string' ? returnTo : '',
        });
        throw new GoogleSignInError('pending_deletion', handoff);
      }
      return sessionUser(user, data.accessToken, data.refreshToken);
    },
  }),
  // "Reactivate Account" on /login/reactivate: takes only a handoff this server sealed, cancels the deletion with its
  // tokens and signs in with the restored account.
  Credentials({
    id: 'reactivated',
    name: 'Reactivated account',
    credentials: { handoff: {} },
    async authorize(credentials) {
      const apiRoot = tryGetPublicBackendBaseUrl();
      const handoff = await openHandoff(credentials?.handoff);
      if (!apiRoot || !handoff) throw new GoogleSignInError('signin_expired');

      let res: Response;
      try {
        res = await fetch(`${apiRoot}/users/me/cancel-deletion`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${handoff.accessToken}` },
          cache: 'no-store',
        });
      } catch {
        throw new GoogleSignInError('google_failed');
      }
      const json = res.ok ? await res.json().catch(() => null) : null;
      const user = (json?.success ? json.data : null) as BackendAuthUser | null;
      if (!user?._id || user.isPendingDeletion || hasAdminRole(user.roles)) {
        throw new GoogleSignInError('google_failed');
      }
      return sessionUser(user, handoff.accessToken, handoff.refreshToken);
    },
  }),
  Credentials({
    credentials: {
      username: { label: 'Username', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const apiRoot = tryGetPublicBackendBaseUrl();
      if (!apiRoot || !credentials?.username || !credentials?.password) return null;

      try {
        const res = await fetch(`${apiRoot}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.username,
            password: credentials.password,
            loginType: 'email',
          }),
        });
        if (!res.ok) return null;
        const json = await res.json();
        if (!json.success || !json.data) return null;

        const { accessToken, refreshToken, user } = json.data as {
          accessToken: string;
          refreshToken: string;
          user: BackendAuthUser;
        };
        // This form is the admin login; any other email account stays out.
        if (!hasAdminRole(user.roles)) return null;

        return {
          id: user._id,
          name: user.fullName ?? user.email,
          email: user.email,
          image: user.profilePicture?.url ?? null,
          backendAccessToken: accessToken,
          backendRefreshToken: refreshToken,
          roles: user.roles ?? [],
        };
      } catch {
        return null;
      }
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: authSecret,
  providers,
  pages: {
    signIn: '/login',
  },
  events: {
    // Every sign-out (the menus' signOut()) also ends the backend session, so the refresh token left behind is dead.
    async signOut(message) {
      const token = 'token' in message ? message.token : null;
      if (typeof token?.backendRefreshToken === 'string') {
        await revokeBackendSession(token.backendRefreshToken);
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        const u = user as UserWithTokens;
        if (u.backendAccessToken) {
          token.backendAccessToken = u.backendAccessToken;
          token.backendRefreshToken = u.backendRefreshToken;
          token.backendAccessTokenExpires = getJwtExpiry(u.backendAccessToken);
        }
        token.roles = u.roles ?? [];
      }
      // Refresh only when the browser asks (update() is a route handler, so the new cookie is saved; a refresh
      // during a server render would be lost and burn the rotated refresh token). `failedToken` makes a second tab's
      // request a no-op once the first tab has already refreshed.
      // update() bodies come from the browser: check every field.
      const ask =
        trigger === 'update' && session && typeof session === 'object'
          ? (session as SessionUpdate)
          : undefined;
      if (ask && 'refresh' in ask && ask.refresh === true && typeof token.backendRefreshToken === 'string') {
        if (ask.failedToken && ask.failedToken !== token.backendAccessToken) return token;
        const next = await refreshBackendTokens(token.backendRefreshToken);
        if (!next) return { ...token, error: 'RefreshFailed' };
        token.backendAccessToken = next.accessToken;
        token.backendRefreshToken = next.refreshToken;
        token.backendAccessTokenExpires = getJwtExpiry(next.accessToken);
        if (next.roles) token.roles = next.roles;
        delete token.error;
      }
      // After Edit profile saves, the header shows the new name and picture: only the person's own display data,
      // and only an https picture.
      const profile = ask && 'profile' in ask ? ask.profile : null;
      if (profile && typeof profile === 'object') {
        const { name, image } = profile as { name?: unknown; image?: unknown };
        if (typeof name === 'string' && name.trim()) token.name = name.trim().slice(0, 50);
        if (image === null) token.picture = null;
        else if (typeof image === 'string' && image.startsWith('https://')) token.picture = image;
      }
      return token;
    },
    session({ session, token }) {
      // Stable opaque token used by the admin API client (Next.js routes re-verify via auth())
      session.accessToken = token.userId as string;
      if (token.userId) session.user.id = token.userId as string;
      // The refresh token stays in the encrypted cookie; the browser only gets the access token it needs.
      if (token.backendAccessToken) {
        session.backendAccessToken = token.backendAccessToken as string;
        session.backendAccessTokenExpires =
          (token.backendAccessTokenExpires as number | null) ?? null;
      }
      if (token.error === 'RefreshFailed') session.error = 'RefreshFailed';
      session.user.roles = (token.roles as string[]) ?? [];
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn || !hasAdminRole(session?.user?.roles)) return false;
        const allowed =
          process.env.ADMIN_ALLOWED_EMAILS?.split(',')
            .map(e => e.trim())
            .filter(Boolean) ?? [];
        if (allowed.length > 0 && !allowed.includes(session?.user?.email ?? '')) {
          return false;
        }
        return true;
      }
      return true;
    },
  },
});

interface UserWithTokens {
  backendAccessToken?: string;
  backendRefreshToken?: string;
  roles?: string[];
}

/** What the browser sends with update() to ask for new backend tokens. */
export type RefreshRequest = { refresh: true; failedToken?: string };

/** What Edit profile sends with update() once the backend saved the profile. */
export type ProfileUpdate = { profile: { name?: string; image?: string | null } };

type SessionUpdate = RefreshRequest | ProfileUpdate;

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    backendAccessToken?: string;
    /** ms since epoch; null when the token has no `exp`. */
    backendAccessTokenExpires?: number | null;
    /** Set when the refresh token was refused: the user must log in again. */
    error?: 'RefreshFailed';
  }
  interface User {
    backendAccessToken?: string;
    backendRefreshToken?: string;
    roles?: string[];
  }
}
