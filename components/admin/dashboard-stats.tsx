'use client';

import { useAdminStats } from '@/hooks/use-admin-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Tag, Users, TrendingUp } from 'lucide-react';

export default function DashboardStats() {
  const { data, isLoading, isError, error } = useAdminStats();

  const stats = [
    { label: 'Total Posts', value: data?.posts, icon: FileText },
    { label: 'Total Tags', value: data?.tags, icon: Tag },
    { label: 'Total Authors', value: data?.authors, icon: Users },
    { label: 'Published', value: data?.posts, icon: TrendingUp },
  ];

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-mukta text-red-700">
        Failed to load stats: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="rounded-2xl shadow-sm border-neutral-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-mukta font-medium text-neutral-500">
              {label}
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-[#611508]/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#611508]" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <p className="text-3xl font-mukta font-semibold text-neutral-800">{value ?? 0}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
