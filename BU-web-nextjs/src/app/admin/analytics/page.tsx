'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const PlatformAnalytics = dynamic(
  () =>
    import('@/components/admin/platform-analytics').then(
      (m) => m.PlatformAnalytics,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Detailed platform metrics and insights
        </p>
      </div>
      <PlatformAnalytics />
    </div>
  );
}
