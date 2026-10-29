import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/admin-access';

export default async function AdminOnlyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!isAdminSession(session)) redirect('/admin/dashboard');

  return <>{children}</>;
}
