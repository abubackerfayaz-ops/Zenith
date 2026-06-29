'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const ProfileAnalytics = dynamic(
  () =>
    import('@/components/profile/profile-analytics').then(
      (m) => m.ProfileAnalytics,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

const FameScoreDisplay = dynamic(
  () =>
    import('@/components/ai/fame-score-display').then(
      (m) => m.FameScoreDisplay,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

export default function CreatorAnalyticsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Creator Analytics</h1>
        <p className="text-muted-foreground">
          Your content performance and audience insights
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <ProfileAnalytics />
        </div>
        <aside>
          <FameScoreDisplay />
        </aside>
      </div>
    </div>
  );
}
