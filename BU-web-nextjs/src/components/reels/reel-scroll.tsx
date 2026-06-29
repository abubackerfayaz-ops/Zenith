'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReelCard } from './reel-card';
import { Spinner } from '@/components/ui/spinner';
import type { Reel } from '@/types';

interface ReelScrollProps {
  reels: Reel[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onLike?: (reelId: string) => void;
  onComment?: (reelId: string) => void;
  onShare?: (reelId: string) => void;
  onSave?: (reelId: string) => void;
  onUserClick?: (userId: string) => void;
  onRemix?: (reelId: string) => void;
  className?: string;
}

export function ReelScroll({
  reels,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onLike,
  onComment,
  onShare,
  onSave,
  onUserClick,
  onRemix,
  className,
}: ReelScrollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const goToNext = useCallback(() => {
    if (isTransitioning || activeIndex >= reels.length - 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [activeIndex, reels.length, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || activeIndex <= 0) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [activeIndex, isTransitioning]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isTransitioning) return;
      if (e.deltaY > 0) goToNext();
      else goToPrev();
    },
    [goToNext, goToPrev, isTransitioning],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') goToNext();
      if (e.key === 'ArrowUp') goToPrev();
    },
    [goToNext, goToPrev],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  // Load more when reaching the end
  useEffect(() => {
    if (activeIndex >= reels.length - 2 && hasMore && !isLoading) {
      onLoadMore?.();
    }
  }, [activeIndex, reels.length, hasMore, isLoading, onLoadMore]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        'relative h-full max-h-[calc(100vh-8rem)] overflow-hidden bg-black rounded-2xl',
        className,
      )}
    >
      {/* Reels Container */}
      <div
        className="transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${activeIndex * 100}%)` }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="h-full snap-start"
            style={{ height: '100%' }}
          >
            <ReelCard
              reel={reel}
              isActive={index === activeIndex}
              onLike={onLike}
              onComment={onComment}
              onShare={onShare}
              onSave={onSave}
              onUserClick={onUserClick}
              onRemix={onRemix}
            />
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Spinner size="sm" color="white" />
        </div>
      )}

      {/* Navigation Hints */}
      {activeIndex > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-50">
          <ChevronUp size={20} className="text-white" />
        </div>
      )}
      {activeIndex < reels.length - 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-50">
          <ChevronDown size={20} className="text-white" />
        </div>
      )}

      {/* Progress Indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {reels.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'w-1.5 rounded-full transition-all duration-200',
              index === activeIndex
                ? 'h-6 bg-white'
                : 'h-1.5 bg-white/40 hover:bg-white/60',
            )}
          />
        ))}
      </div>
    </div>
  );
}
