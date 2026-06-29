'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn, formatNumber, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LikeAnimation } from './like-animation';
import type { Post, Media as MediaType } from '@/types';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  className?: string;
}

function MediaCarousel({ media }: { media: MediaType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  if (media.length === 0) return null;

  const current = media[currentIndex];

  return (
    <div className="relative aspect-square bg-muted rounded-xl overflow-hidden group">
      {current.type === 'video' ? (
        <video
          src={current.url}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
        />
      ) : (
        <img
          src={current.url}
          alt={current.alt || 'Post media'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Mute Button */}
      {current.type === 'video' && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      )}

      {/* Carousel Controls */}
      {media.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {currentIndex < media.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex + 1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={16} />
            </button>
          )}
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {media.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  i === currentIndex ? 'bg-white w-4' : 'bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HighlightText({ text }: { text: string }) {
  const parts = text.split(/(#\w+|@\w+)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('#')) {
          return (
            <span key={i} className="text-primary-500 cursor-pointer hover:underline">
              {part}
            </span>
          );
        }
        if (part.startsWith('@')) {
          return (
            <span key={i} className="text-accent-500 cursor-pointer hover:underline">
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onUserClick,
  className,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 800);
    }
    onLike?.(post.id);
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 800);
    }
    onLike?.(post.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(post.id);
  };

  const caption = post.content || '';
  const truncatedCaption = caption.length > 150 && !showFullCaption
    ? caption.slice(0, 150) + '...'
    : caption;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl overflow-hidden glass-card border border-white/10',
        className,
      )}
    >
      {/* User Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div
            className="cursor-pointer"
            onClick={() => onUserClick?.(post.author.id)}
          >
            <Avatar
              src={post.author.avatarUrl}
              name={post.author.displayName}
              size="md"
              isVerified={post.author.isVerified}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUserClick?.(post.author.id)}
                className="text-sm font-semibold text-foreground hover:underline"
              >
                {post.author.displayName}
              </button>
              {post.author.isVerified && (
                <Badge variant="primary" className="text-[8px] px-1 py-0">✓</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {post.author.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin size={10} />
                  {post.author.location}
                  <span className="mx-1">·</span>
                </span>
              )}
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <button className="p-1.5 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Media */}
      <div ref={mediaRef} className="relative" onDoubleClick={handleDoubleTap}>
        <MediaCarousel media={post.media} />
        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <LikeAnimation />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Heart size={20} className={isLiked ? 'fill-red-500' : ''} />
          </motion.button>
          <button
            onClick={() => onComment?.(post.id)}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle size={20} />
          </button>
          <button
            onClick={() => onShare?.(post.id)}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleSave}
          className={cn(
            'p-1.5 rounded-full transition-colors',
            isSaved ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {isSaved ? <BookmarkCheck size={20} className="fill-amber-500" /> : <Bookmark size={20} />}
        </motion.button>
      </div>

      {/* Counts */}
      <div className="px-3 pb-1">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {formatNumber(likeCount)} likes
        </p>
      </div>

      {/* Caption */}
      {caption && (
        <div className="px-3 pb-1">
          <p className="text-sm text-foreground">
            <span className="font-semibold mr-1.5">{post.author.displayName}</span>
            <HighlightText text={truncatedCaption} />
          </p>
          {caption.length > 150 && (
            <button
              onClick={() => setShowFullCaption(!showFullCaption)}
              className="text-xs text-muted-foreground hover:text-foreground mt-0.5"
            >
              {showFullCaption ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div className="px-3 pb-1 flex flex-wrap gap-1">
          {post.hashtags.map((tag) => (
            <span key={tag.id} className="text-xs text-primary-500 hover:underline cursor-pointer">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Comment Preview */}
      {post.commentsCount > 0 && (
        <button
          onClick={() => onComment?.(post.id)}
          className="px-3 pb-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all {formatNumber(post.commentsCount)} comments
        </button>
      )}
    </motion.div>
  );
}
