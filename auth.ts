import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
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
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl || !credentials?.username || !credentials?.password) return null;

        try {
          const res = await fetch(`${backendUrl}/auth/login`, {
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
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (backendUrl) {
          try {
            const res = await fetch(`${backendUrl}/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: account.id_token }),
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
