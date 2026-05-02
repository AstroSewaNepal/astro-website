import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { auth, signIn } from '@/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // JWTSessionError can be thrown when a stale cookie was signed with a different
  // AUTH_SECRET — catch it and treat as logged-out rather than crashing the page.
  let session = null;
  try {
    session = await auth();
    console.log('session', session);
  } catch {
    // invalid / expired JWT — fall through to the login form
  }
  if (session?.user) redirect('/admin/dashboard');

  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f3df]">
      <Card className="w-full max-w-md mx-4 shadow-xl rounded-2xl border-0">
        <CardHeader className="text-center pb-2 pt-8">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#611508' }}
            >
              <span className="text-[#F8F3DF] font-mukta text-xl font-bold">A</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-mukta text-neutral-800">Admin Sign In</CardTitle>
          <CardDescription className="font-mukta text-neutral-500">
            Access the Astro Sewa admin panel
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-4">
          {/* Error banner */}
          {error === 'InvalidCredentials' && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-mukta">
              Invalid username or password. Please try again.
            </div>
          )}
          {error === 'OAuthError' && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-mukta">
              Google sign-in failed. Please try again.
            </div>
          )}

          {/* Credentials form — uses server action */}
          <form
            action={async (formData: FormData) => {
              'use server';
              try {
                await signIn('credentials', {
                  username: formData.get('username'),
                  password: formData.get('password'),
                  redirectTo: '/admin/dashboard',
                });
              } catch (e) {
                if (e instanceof AuthError) {
                  redirect('/login?error=InvalidCredentials');
                }
                throw e;
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="username" className="font-mukta text-neutral-700">
                Usernames
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter admin username"
                required
                className="rounded-xl border-neutral-200 font-mukta focus-visible:ring-[#611508] focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-mukta text-neutral-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
                className="rounded-xl border-neutral-200 font-mukta focus-visible:ring-[#611508] focus-visible:ring-offset-0"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl font-mukta text-base py-5"
              style={{ backgroundColor: '#611508' }}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-neutral-400 font-mukta uppercase tracking-wide">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Google OAuth — server action */}
          <form
            action={async () => {
              'use server';
              try {
                await signIn('google', { redirectTo: '/admin/dashboard' });
              } catch (e) {
                if (e instanceof AuthError) {
                  redirect('/login?error=OAuthError');
                }
                throw e;
              }
            }}
          >
            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-xl font-mukta border-neutral-300 hover:bg-neutral-50 py-5"
            >
              {/* Google Icon */}
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
