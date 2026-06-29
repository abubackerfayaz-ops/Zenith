'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const FameScoreDisplay = dynamic(
  () =>
    import('@/components/ai/fame-score-display').then(
      (m) => m.FameScoreDisplay,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

const ContentSuggestions = dynamic(
  () =>
    import('@/components/ai/content-suggestions').then(
      (m) => m.ContentSuggestions,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

const PersonalityBadge = dynamic(
  () =>
    import('@/components/ai/personality-badge').then(
      (m) => m.PersonalityBadge,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

export default function FameScorePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fame Score</h1>
        <p className="text-muted-foreground">
          Your AI-powered influence dashboard
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <FameScoreDisplay />
          <ContentSuggestions />
        </div>
        <aside>
          <PersonalityBadge />
        </aside>
      </div>
    </div>
  );
}
