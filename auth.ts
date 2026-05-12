import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

/**
 * Auth.js requires a secret to sign cookies and JWTs.
 * Set `AUTH_SECRET` in `.env.local` (e.g. `openssl rand -base64 32`).
 * A dev-only fallback avoids "MissingSecret" when the var is absent locally;
 * never rely on that in production—deploy must define AUTH_SECRET.
 */
const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV !== 'production'
    ? 'local-dev-only-insecure-auth-secret'
    : undefined);

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: authSecret,
  providers: [
    /**
     * Redirect URI sent to Google is always:
     *   `{AUTH_URL or request origin}/api/auth/callback/google`
     * e.g. http://localhost:3000/api/auth/callback/google
     * That exact string must appear under Google Cloud Console → OAuth 2.0 Client →
     * "Authorized redirect URIs" (localhost vs 127.0.0.1 are different entries).
     * Nest’s `GOOGLE_REDIRECT_URI_WEB` (`…/api/v1/auth/google/callback`) is a separate flow.
     */
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
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
            user: {
              _id: string;
              email: string;
              fullName?: string;
              profilePicture?: { url: string };
            };
          };

          return {
            id: user._id,
            name: user.fullName ?? user.email,
            email: user.email,
            image: user.profilePicture?.url ?? null,
            backendAccessToken: accessToken,
            backendRefreshToken: refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && account.id_token) {
        const apiRoot = tryGetPublicBackendBaseUrl();
        if (apiRoot) {
          try {
            const res = await fetch(`${apiRoot}/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idToken: account.id_token,
                role: 'USER',
              }),
            });
            if (res.ok) {
              const json = await res.json();
              if (json.success && json.data) {
                const u = user as UserWithTokens;
                u.backendAccessToken = json.data.accessToken;
                u.backendRefreshToken = json.data.refreshToken;
                if (json.data.user?._id) user.id = json.data.user._id;
              }
            }
          } catch {
            // backend unavailable — allow login without backend tokens
          }
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        const u = user as UserWithTokens;
        if (u.backendAccessToken) {
          token.backendAccessToken = u.backendAccessToken;
          token.backendRefreshToken = u.backendRefreshToken;
        }
      }
      return token;
    },
    session({ session, token }) {
      // Stable opaque token used by the admin API client (Next.js routes re-verify via auth())
      session.accessToken = token.userId as string;
      if (token.userId) session.user.id = token.userId as string;
      if (token.backendAccessToken) {
        session.backendAccessToken = token.backendAccessToken as string;
        session.backendRefreshToken = token.backendRefreshToken as string;
      }
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false;
        const allowed = process.env.ADMIN_ALLOWED_EMAILS
          ?.split(',')
          .map((e) => e.trim())
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
}

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    backendAccessToken?: string;
    backendRefreshToken?: string;
  }
  interface User {
    backendAccessToken?: string;
    backendRefreshToken?: string;
  }
}
