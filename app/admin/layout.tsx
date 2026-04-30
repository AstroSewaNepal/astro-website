import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import { QueryProvider } from '@/providers/query-provider';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    // SessionProvider passes the server session to useSession() in client hooks
    // Providing session prop avoids an extra network round-trip on mount
    <SessionProvider session={session}>
      <QueryProvider>
        <div className="flex h-screen bg-neutral-50 overflow-hidden">
          <AdminSidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <AdminHeader user={session.user} />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </QueryProvider>
    </SessionProvider>
  );
}
