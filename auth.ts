import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { hasAdminRole } from '@/lib/admin-access';
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV !== 'production'
    ? 'local-dev-only-insecure-auth-secret'
    : undefined);

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  );
}

providers.push(
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
              roles?: string[];
            };
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
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: authSecret,
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;
      // Fail closed: without backend tokens the session would look logged in
      // while every API call is rejected, so refuse the sign-in instead.
      const apiRoot = tryGetPublicBackendBaseUrl();
      if (!account.id_token || !apiRoot) return false;
      try {
        const res = await fetch(`${apiRoot}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: account.id_token,
            role: 'USER',
          }),
        });
        if (!res.ok) return false;
        const json = await res.json();
        if (!json.success || !json.data?.accessToken || !json.data.user?._id) return false;
        const u = user as UserWithTokens;
        u.backendAccessToken = json.data.accessToken;
        u.backendRefreshToken = json.data.refreshToken;
        u.roles = json.data.user.roles ?? [];
        user.id = json.data.user._id;
        return true;
      } catch {
        return false;
      }
    },
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        const u = user as UserWithTokens;
        if (u.backendAccessToken) {
          token.backendAccessToken = u.backendAccessToken;
          token.backendRefreshToken = u.backendRefreshToken;
        }
        token.roles = u.roles ?? [];
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
      session.user.roles = (token.roles as string[]) ?? [];
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn || !hasAdminRole(session?.user?.roles)) return false;
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
  roles?: string[];
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
    roles?: string[];
  }
}
