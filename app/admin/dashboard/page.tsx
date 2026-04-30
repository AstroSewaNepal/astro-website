import type { Metadata } from 'next';
import DashboardStats from '@/components/admin/dashboard-stats';
import RecentPostsTable from '@/components/admin/recent-posts-table';

export const metadata: Metadata = {
  title: 'Dashboard | Astro Sewa Admin',
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-mukta font-semibold text-neutral-800">Dashboard</h2>
        <p className="text-neutral-500 font-mukta text-sm mt-1">
          Overview of your Astro Sewa content
        </p>
      </div>

      <DashboardStats />
      <RecentPostsTable />
    </div>
  );
}
