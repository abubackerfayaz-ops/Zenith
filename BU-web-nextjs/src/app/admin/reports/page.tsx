'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const ReportsPanel = dynamic(
  () =>
    import('@/components/admin/reports-panel').then(
      (m) => m.ReportsPanel,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

export default function AdminReportsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Review and resolve user reports
        </p>
      </div>
      <ReportsPanel />
    </div>
  );
}
