'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const ReelScroll = dynamic(
  () => import('@/components/reels/reel-scroll').then((m) => m.ReelScroll),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

export default function ReelsPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Reels</h1>
      <ReelScroll />
    </div>
  );
}
