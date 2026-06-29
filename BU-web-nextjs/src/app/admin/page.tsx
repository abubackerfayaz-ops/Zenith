'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const AdminStatsCards = dynamic(
  () =>
    import('@/components/admin/admin-stats-cards').then(
      (m) => m.AdminStatsCards,
    ),
  {
    loading: () => <Spinner size="lg" />,
  },
);

const PlatformAnalytics = dynamic(
  () =>
    import('@/components/admin/platform-analytics').then(
      (m) => m.PlatformAnalytics,
    ),
  {
    loading: () => <Spinner size="lg" />,
  },
);

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and key metrics
        </p>
      </div>
      <div className="space-y-6">
        <AdminStatsCards />
        <PlatformAnalytics />
      </div>
    </div>
  );
}
