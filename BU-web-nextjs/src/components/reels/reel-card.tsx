'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Music,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Disc3,
} from 'lucide-react';
import { cn, formatNumber, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LikeAnimation } from '@/components/posts/like-animation';
import type { Reel } from '@/types';

interface ReelCardProps {
  reel: Reel;
  isActive?: boolean;
  onLike?: (reelId: string) => void;
  onComment?: (reelId: string) => void;
  onShare?: (reelId: string) => void;
  onSave?: (reelId: string) => void;
  onUserClick?: (userId: string) => void;
  onRemix?: (reelId: string) => void;
  className?: string;
}

export function ReelCard({
  reel,
  isActive = false,
  onLike,
  onComment,
  onShare,
  onSave,
  onUserClick,
  onRemix,
  className,
}: ReelCardProps) {
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [isSaved, setIsSaved] = useState(reel.isSaved);
  const [likeCount, setLikeCount] = useState(reel.likesCount);
  const [isMuted, setIsMuted] = useState(true);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 800);
    }
    onLike?.(reel.id);
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
    onLike?.(reel.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(reel.id);
  };

  const caption = reel.caption || '';
  const truncatedCaption = caption.length > 100 && !showFullCaption
    ? caption.slice(0, 100) + '...'
    : caption;

  return (
    <div className={cn('relative w-full h-full bg-black snap-start', className)}>
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.media.url}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={handleDoubleTap}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Like Animation */}
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <LikeAnimation />
        </div>
      )}

      {/* Mute Button */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Action Sidebar */}
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-4">
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className="flex flex-col items-center gap-0.5"
        >
          <div
            className={cn(
              'p-2 rounded-full transition-colors',
              isLiked ? 'text-red-500' : 'text-white hover:text-white/80',
            )}
          >
            <Heart size={26} className={isLiked ? 'fill-red-500' : ''} />
          </div>
          <span className="text-[10px] font-semibold text-white tabular-nums">
            {formatNumber(likeCount)}
          </span>
        </motion.button>

        {/* Comment */}
        <button
          onClick={(e) => { e.stopPropagation(); onComment?.(reel.id); }}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="p-2 rounded-full text-white hover:text-white/80 transition-colors">
            <MessageCircle size={26} />
          </div>
          <span className="text-[10px] font-semibold text-white tabular-nums">
            {formatNumber(reel.commentsCount)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={(e) => { e.stopPropagation(); onShare?.(reel.id); }}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="p-2 rounded-full text-white hover:text-white/80 transition-colors">
            <Share2 size={24} />
          </div>
          <span className="text-[10px] font-semibold text-white tabular-nums">
            {formatNumber(reel.sharesCount)}
          </span>
        </button>

        {/* Remix */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemix?.(reel.id); }}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="p-2 rounded-full text-white hover:text-white/80 transition-colors">
            <Disc3 size={24} />
          </div>
          <span className="text-[10px] font-semibold text-white">Remix</span>
        </button>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); handleSave(); }}
          className="flex flex-col items-center gap-0.5"
        >
          <div
            className={cn(
              'p-2 rounded-full transition-colors',
              isSaved ? 'text-amber-500' : 'text-white hover:text-white/80',
            )}
          >
            {isSaved ? (
              <BookmarkCheck size={24} className="fill-amber-500" />
            ) : (
              <Bookmark size={24} />
            )}
          </div>
          <span className="text-[10px] font-semibold text-white">Save</span>
        </motion.button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-16 z-10 space-y-2">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <button onClick={() => onUserClick?.(reel.author.id)}>
            <Avatar
              src={reel.author.avatarUrl}
              name={reel.author.displayName}
              size="sm"
              isVerified={reel.author.isVerified}
              className="ring-2 ring-white/30"
            />
          </button>
          <button
            onClick={() => onUserClick?.(reel.author.id)}
            className="text-sm font-semibold text-white hover:underline"
          >
            {reel.author.displayName}
          </button>
          <Badge variant="primary" className="text-[8px] px-1.5 py-0">
            Follow
          </Badge>
        </div>

        {/* Caption */}
        {caption && (
          <p className="text-xs text-white/90">
            {truncatedCaption}
            {caption.length > 100 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowFullCaption(!showFullCaption); }}
                className="text-white/60 hover:text-white ml-1"
              >
                {showFullCaption ? 'less' : 'more'}
              </button>
            )}
          </p>
        )}

        {/* Music */}
        <div className="flex items-center gap-1.5 text-xs text-white/70">
          <Music size={12} />
          <span className="truncate">Original audio</span>
        </div>
      </div>
    </div>
  );
}
