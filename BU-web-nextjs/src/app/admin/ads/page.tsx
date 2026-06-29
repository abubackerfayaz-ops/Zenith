'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const AdsManager = dynamic(
  () =>
    import('@/components/admin/ads-manager').then((m) => m.AdsManager),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

export default function AdminAdsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ads Manager</h1>
        <p className="text-muted-foreground">
          Manage advertisements and sponsorships
        </p>
      </div>
      <AdsManager />
    </div>
  );
}
