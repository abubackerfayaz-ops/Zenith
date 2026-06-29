'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Smile,
  MoreHorizontal,
} from 'lucide-react';
import { cn, formatNumber, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Comment, User } from '@/types';

type SortOption = 'top' | 'newest' | 'oldest';

interface CommentSectionProps {
  comments: Comment[];
  currentUser?: User | null;
  postId: string;
  onLikeComment?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  onAddComment?: (content: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

function CommentItem({
  comment,
  currentUser,
  onLike,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  currentUser?: User | null;
  onLike?: (id: string) => void;
  onReply?: (id: string, content: string) => void;
  depth?: number;
}) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likesCount);
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    onLike?.(comment.id);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply?.(comment.id, replyText.trim());
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2', depth > 0 && 'ml-10 pl-3 border-l border-white/10')}
    >
      <Avatar
        src={comment.author.avatarUrl}
        name={comment.author.displayName}
        size="sm"
        isVerified={comment.author.isVerified}
      />
      <div className="flex-1 min-w-0">
        <div className="rounded-xl bg-white/[0.04] px-3 py-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold text-foreground">
              {comment.author.displayName}
            </span>
            {comment.author.isVerified && (
              <Badge variant="primary" className="text-[7px] px-1 py-0">✓</Badge>
            )}
          </div>
          <p className="text-sm text-foreground/90">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-[10px] text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className={cn(
              'flex items-center gap-0.5 text-[10px] font-medium transition-colors',
              isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Heart size={10} className={isLiked ? 'fill-red-500' : ''} />
            {likeCount > 0 && formatNumber(likeCount)}
          </motion.button>
          {depth === 0 && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Reply
            </button>
          )}
          <button className="ml-auto p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal size={10} />
          </button>
        </div>

        {/* Reply Input */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mt-2">
                <Avatar
                  src={currentUser?.avatarUrl}
                  name={currentUser?.displayName}
                  size="xs"
                />
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
                  className="flex-1 glass-input text-xs py-1.5 px-3 rounded-full"
                  autoFocus
                />
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                  className="p-1.5 rounded-full text-primary-500 hover:bg-primary-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Replies */}
        {comment.repliesCount > 0 && depth === 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 mt-1 ml-1 text-xs text-primary-500 hover:text-primary-400 transition-colors"
          >
            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showReplies ? 'Hide' : 'View'} {formatNumber(comment.repliesCount)} {comment.repliesCount === 1 ? 'reply' : 'replies'}
          </button>
        )}
        {/* Load replies - would fetch from API */}
      </div>
    </motion.div>
  );
}

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
];

export function CommentSection({
  comments,
  currentUser,
  onLikeComment,
  onReply,
  onAddComment,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>('top');
  const [commentText, setCommentText] = useState('');

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    onAddComment?.(commentText.trim());
    setCommentText('');
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Sort */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageCircle size={14} />
          Comments ({formatNumber(comments.length || 0)})
        </h3>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={cn(
                'px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors',
                sortBy === opt.id
                  ? 'bg-primary-500/20 text-primary-500'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageCircle size={24} className="text-muted-foreground mb-2" />
            <p className="text-sm text-foreground font-medium">No comments yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to share your thoughts
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  onLike={onLikeComment}
                  onReply={onReply}
                />
              ))}
            </AnimatePresence>

            {hasMore && (
              <button
                onClick={onLoadMore}
                className="w-full py-2 text-xs text-primary-500 hover:text-primary-400 transition-colors"
              >
                Load more comments
              </button>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Avatar
            src={currentUser?.avatarUrl}
            name={currentUser?.displayName}
            size="sm"
          />
          <div className="flex-1 flex items-center gap-2 glass-input rounded-full px-3 py-1.5">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
              <Smile size={16} />
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!commentText.trim()}
            className="p-2 rounded-full text-primary-500 hover:bg-primary-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
