'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const ContentModeration = dynamic(
  () =>
    import('@/components/admin/content-moderation').then(
      (m) => m.ContentModeration,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

export default function AdminContentPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">
          Review flagged content and enforce community guidelines
        </p>
      </div>
      <ContentModeration />
    </div>
  );
}
