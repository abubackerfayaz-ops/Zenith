'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Send,
  Heart,
  Smile,
  Volume2,
  VolumeX,
  Pause,
  Play,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import type { Story, User } from '@/types';

const EMOTION_REACTIONS = ['❤️', '🔥', '😂', '😱', '😍', '💀', '🙌', '✨'];

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReply?: (storyId: string, message: string) => void;
  onReaction?: (storyId: string, emoji: string) => void;
  onUserClick?: (userId: string) => void;
  currentUser?: User | null;
  className?: string;
}

export function StoryViewer({
  stories,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
  onReply,
  onReaction,
  onUserClick,
  currentUser,
  className,
}: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval>>();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentStory = stories[currentIndex];
  const storyDuration = 5000;

  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  useEffect(() => {
    resetProgress();
  }, [currentIndex, resetProgress]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / storyDuration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(progressRef.current);
        onNext();
      }
    }, 50);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isOpen, isPaused, currentIndex, onNext, storyDuration]);

  if (!currentStory) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      setIsSwiping(true);
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeOffset(dx);
    } else {
      setSwipeOffset(dy);
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (Math.abs(swipeOffset) > 80) {
      if (swipeOffset > 0) {
        onPrev();
      } else {
        onNext();
      }
    }
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply?.(currentStory.id, replyText.trim());
    setReplyText('');
  };

  const handleReaction = (emoji: string) => {
    onReaction?.(currentStory.id, emoji);
    setShowEmojiPicker(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center bg-black',
            className,
          )}
        >
          {/* Main Story Container */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsPaused(true)}
            onDragEnd={(_, info) => {
              setIsPaused(false);
              if (info.offset.x > 80) onPrev();
              else if (info.offset.x < -80) onNext();
            }}
            className={cn(
              'relative w-full h-full max-w-[420px] max-h-[90vh]',
              'sm:rounded-2xl sm:h-[90vh] overflow-hidden',
              'bg-black',
            )}
          >
            {/* Media */}
            {currentStory.media.type === 'video' ? (
              <video
                src={currentStory.media.url}
                className="w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                loop
                playsInline
              />
            ) : (
              <img
                src={currentStory.media.url}
                alt="Story"
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
              {stories.map((story, i) => (
                <div key={story.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full bg-white rounded-full transition-all duration-100',
                      i < currentIndex && 'w-full',
                      i === currentIndex && 'w-full',
                      i > currentIndex && 'w-0',
                    )}
                    style={{
                      width: i === currentIndex ? `${progress}%` : undefined,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-3 left-0 right-0 z-10 flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <button onClick={() => onUserClick?.(currentStory.author.id)}>
                  <Avatar
                    src={currentStory.author.avatarUrl}
                    name={currentStory.author.displayName}
                    size="sm"
                    isVerified={currentStory.author.isVerified}
                  />
                </button>
                <div>
                  <button
                    onClick={() => onUserClick?.(currentStory.author.id)}
                    className="text-sm font-semibold text-white hover:underline"
                  >
                    {currentStory.author.displayName}
                  </button>
                  <p className="text-[10px] text-white/70">
                    {timeAgo(currentStory.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tap Navigation (invisible zones) */}
            <div
              className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
            />
            <div
              className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
            />

            {/* Caption */}
            {currentStory.caption && (
              <div className="absolute bottom-24 left-4 right-4 z-10">
                <p className="text-sm text-white/90 drop-shadow-lg">
                  {currentStory.caption}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="absolute bottom-4 left-0 right-0 z-10 px-3">
              {/* Emoji Reactions */}
              <div className="flex items-center justify-center gap-2 mb-3">
                {EMOTION_REACTIONS.slice(0, 5).map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(emoji)}
                    className="text-xl hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </motion.button>
                ))}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <Smile size={16} />
                </button>
              </div>

              {/* Reply Input */}
              <div className="flex items-center gap-2">
                <Avatar
                  src={currentUser?.avatarUrl}
                  name={currentUser?.displayName}
                  size="xs"
                />
                <div className="flex-1 flex items-center gap-2 bg-white/20 backdrop-blur-xl rounded-full px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Send message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
                  />
                  {replyText.trim() && (
                    <button onClick={handleSendReply}>
                      <Send size={16} className="text-primary-500" />
                    </button>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <Heart size={18} />
                </motion.button>
              </div>
            </div>

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity z-20"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {currentIndex < stories.length - 1 && (
              <button
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity z-20"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
