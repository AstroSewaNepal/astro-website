import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function AdminOnlyLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  if (!roles.includes('SUPER_ADMIN') && !roles.includes('ADMIN')) redirect('/admin/dashboard');

  return <>{children}</>;
}
