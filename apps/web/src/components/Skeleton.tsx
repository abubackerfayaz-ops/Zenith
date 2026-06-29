interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ className = '', variant = 'rectangular', width, height }: SkeletonProps) {
  const base = 'animate-pulse rounded-lg';
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${base} ${variants[variant]} bg-white/[.06] ${className}`}
      style={{ width, height }}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Skeleton variant="circular" width={38} height={38} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="w-full" style={{ height: 268 }} />
      <div className="px-4 py-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function StorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <Skeleton variant="circular" width={52} height={52} />
      <Skeleton className="h-2.5 w-10" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="flex items-end gap-5 -mt-14">
        <Skeleton variant="circular" width={100} height={100} />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
