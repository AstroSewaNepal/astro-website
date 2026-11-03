'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Rendered by a logged-in layout instead of its page when nobody is logged in. Layouts can't read the URL on the
 * server (no proxy.ts on Cloudflare), so the browser sends the visitor to login with the page they wanted.
 */
export function LoginRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(`/login?callbackUrl=${encodeURIComponent(target)}`);
  }, [router, pathname, searchParams]);

  return null;
}
