'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted rounded animate-pulse',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-glass-light before:to-transparent before:bg-[length:200%_100%] before:animate-shimmer',
        className,
      )}
    />
  );
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full rounded', className)} />;
}

export function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn('size-10 rounded-full shrink-0', className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-48 w-full rounded-xl', className)} />;
}

interface SkeletonPostProps {
  className?: string;
}

export function SkeletonPost({ className }: SkeletonPostProps) {
  return (
    <div className={cn('space-y-3 p-4 glass-card', className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="space-y-2 flex-1">
          <SkeletonText className="w-1/3" />
          <SkeletonText className="w-1/4" />
        </div>
      </div>
      <SkeletonCard />
      <div className="space-y-2">
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2" />
      </div>
    </div>
  );
}

interface SkeletonProfileProps {
  className?: string;
}

export function SkeletonProfile({ className }: SkeletonProfileProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <SkeletonText className="w-1/3" />
        <SkeletonText className="w-1/4" />
      </div>
      <div className="flex justify-center gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <SkeletonText className="w-12" />
            <SkeletonText className="w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
