'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Play,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { Post } from '@/types';

interface PostGridProps {
  posts: Post[];
  onPostClick?: (postId: string) => void;
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

function PostGridSkeleton({ columns = 3 }: { columns?: number }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-1', gridCols[columns])}>
      {Array.from({ length: columns * 3 }).map((_, i) => (
        <div key={i} className="aspect-square">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      ))}
    </div>
  );
}

function GridItem({ post, onClick }: { post: Post; onClick?: (id: string) => void }) {
  const media = post.media[0];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(post.id)}
      className="relative aspect-square overflow-hidden group cursor-pointer"
    >
      {media ? (
        <img
          src={media.thumbnailUrl || media.url}
          alt={media.alt || 'Post'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary-900/50 to-accent-900/50 flex items-center justify-center">
          <span className="text-2xl font-bold text-white/30">FW</span>
        </div>
      )}

      {/* Video indicator */}
      {media?.type === 'video' && (
        <div className="absolute top-2 right-2 p-1 rounded-full bg-black/50">
          <Play size={12} className="text-white fill-white" />
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <div className="flex items-center gap-1 text-white">
          <Heart size={16} className="fill-white" />
          <span className="text-xs font-semibold tabular-nums">
            {formatNumber(post.likesCount)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-white">
          <MessageCircle size={16} className="fill-white" />
          <span className="text-xs font-semibold tabular-nums">
            {formatNumber(post.commentsCount)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export function PostGrid({
  posts,
  onPostClick,
  isLoading = false,
  columns = 3,
  className,
}: PostGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  if (isLoading) {
    return <PostGridSkeleton columns={columns} />;
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-white/5 mb-4">
          <Heart size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No posts yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          When posts are created, they will show up here.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('grid gap-1', gridCols[columns], className)}
    >
      {posts.map((post) => (
        <GridItem key={post.id} post={post} onClick={onPostClick} />
      ))}
    </motion.div>
  );
}
