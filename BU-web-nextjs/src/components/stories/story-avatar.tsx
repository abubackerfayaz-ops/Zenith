'use client';

import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface StoryAvatarProps {
  src?: string | null;
  name?: string;
  isSeen?: boolean;
  isLive?: boolean;
  hasStory?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  sm: {
    avatar: 'sm' as const,
    ring: 'w-12 h-12 p-[2px]',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    seenGradient: 'from-gray-400 to-gray-500',
  },
  md: {
    avatar: 'md' as const,
    ring: 'w-16 h-16 p-[3px]',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    seenGradient: 'from-gray-400 to-gray-500',
  },
  lg: {
    avatar: 'lg' as const,
    ring: 'w-20 h-20 p-[3.5px]',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    seenGradient: 'from-gray-400 to-gray-500',
  },
};

export function StoryAvatar({
  src,
  name,
  isSeen = false,
  isLive = false,
  hasStory = false,
  size = 'md',
  onClick,
  className,
}: StoryAvatarProps) {
  const config = sizeMap[size];

  const content = (
    <div className={cn('relative inline-flex flex-col items-center gap-1', className)}>
      {hasStory ? (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br',
            isSeen ? config.seenGradient : config.gradient,
            config.ring,
          )}
        >
          <div className="rounded-full bg-background p-0.5">
            <Avatar
              src={src}
              name={name}
              size={config.avatar}
              className="size-full"
            />
          </div>
        </div>
      ) : (
        <Avatar
          src={src}
          name={name}
          size={config.avatar}
          className="opacity-70"
        />
      )}

      {name && (
        <span
          className={cn(
            'text-[10px] text-center leading-tight max-w-[64px] truncate',
            isSeen ? 'text-muted-foreground' : 'text-foreground font-medium',
          )}
        >
          {name}
        </span>
      )}

      {/* Live Indicator */}
      {isLive && (
        <Badge variant="danger" className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0 text-[8px] font-bold uppercase">
          LIVE
        </Badge>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="focus:outline-none">
        {content}
      </button>
    );
  }

  return content;
}
