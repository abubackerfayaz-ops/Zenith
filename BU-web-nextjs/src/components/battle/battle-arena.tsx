'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Trophy,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Users,
  TrendingUp,
  Clock,
  Send,
  Flame,
  Star,
  ChevronLeft,
} from 'lucide-react';
import { cn, formatNumber, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';

interface BattleContestant {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
  fameScore: number;
  followers: number;
  engagementRate: number;
  totalPosts: number;
  wins: number;
  score: number;
}

interface BattleComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
}

interface BattleArenaProps {
  id: string;
  title: string;
  challenger: BattleContestant;
  challenged: BattleContestant;
  prize: string;
  endsAt: string;
  status: 'upcoming' | 'active' | 'completed';
  winnerId?: string;
  comments: BattleComment[];
  currentUserId?: string;
  onVote: (contestantId: string) => void;
  onSendComment?: (text: string) => void;
  onShare?: () => void;
  onBack?: () => void;
  hasVoted?: boolean;
  className?: string;
}

function BattleTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      setTimeLeft({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2">
      <Clock size={14} className="text-muted-foreground" />
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-black text-foreground tabular-nums">
          {String(timeLeft.h).padStart(2, '0')}
        </span>
        <span className="text-muted-foreground">:</span>
        <span className="text-lg font-black text-foreground tabular-nums">
          {String(timeLeft.m).padStart(2, '0')}
        </span>
        <span className="text-muted-foreground">:</span>
        <span className="text-lg font-black text-foreground tabular-nums">
          {String(timeLeft.s).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function ContestantCard({
  contestant,
  side,
  isWinner,
  voteCount,
  totalVotes,
  onVote,
  hasVoted,
}: {
  contestant: BattleContestant;
  side: 'left' | 'right';
  isWinner: boolean;
  voteCount: number;
  totalVotes: number;
  onVote: () => void;
  hasVoted: boolean;
}) {
  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className={cn(
        'flex-1 glass-card rounded-2xl border p-5 text-center relative overflow-hidden',
        isWinner ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'border-white/10',
      )}
    >
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
      )}

      {isWinner && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="absolute -top-3 -right-3"
        >
          <div className="size-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Trophy size={16} className="text-white" />
          </div>
        </motion.div>
      )}

      <div className="relative z-10 space-y-3">
        <Avatar
          src={contestant.avatarUrl}
          name={contestant.name}
          size="2xl"
          isVerified={contestant.isVerified}
        />
        <div>
          <h3 className="text-base font-bold text-foreground">{contestant.name}</h3>
          <span className="text-xs text-muted-foreground">@{contestant.username}</span>
        </div>

        <div className="flex justify-center gap-4">
          <div className="text-center">
            <span className="text-sm font-bold text-foreground block">{formatNumber(contestant.followers)}</span>
            <span className="text-[9px] text-muted-foreground">Followers</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-foreground block">{contestant.fameScore}</span>
            <span className="text-[9px] text-muted-foreground">Fame Score</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-foreground block">{contestant.wins}</span>
            <span className="text-[9px] text-muted-foreground">Wins</span>
          </div>
        </div>

        <div className="space-y-1">
          <ProgressBar
            value={contestant.engagementRate}
            max={100}
            label="Engagement"
            showLabel
            color="primary"
            size="sm"
          />
        </div>

        {/* Vote Count */}
        <motion.div
          key={voteCount}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-3xl font-black text-foreground tabular-nums"
        >
          {formatNumber(voteCount)}
        </motion.div>

        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
            className={cn(
              'h-full rounded-full',
              side === 'left'
                ? 'bg-gradient-to-r from-primary-500 to-accent-500'
                : 'bg-gradient-to-r from-accent-500 to-pink-500',
            )}
          />
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>

        {!hasVoted && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Zap size={16} />}
            onClick={onVote}
          >
            Vote {contestant.name}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function BattleArena({
  id,
  title,
  challenger,
  challenged,
  prize,
  endsAt,
  status,
  winnerId,
  comments,
  currentUserId,
  onVote,
  onSendComment,
  onShare,
  onBack,
  hasVoted = false,
  className,
}: BattleArenaProps) {
  const [commentText, setCommentText] = useState('');
  const [animatingScore, setAnimatingScore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const totalVotes = challenger.score + challenged.score;

  useEffect(() => {
    if (animatingScore) {
      const timer = setTimeout(() => setAnimatingScore(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animatingScore]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleVote = (contestantId: string) => {
    setAnimatingScore(true);
    onVote(contestantId);
  };

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onSendComment?.(text);
    setCommentText('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-full hover:bg-glass-light text-muted-foreground transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{prize}</span>
            </div>
          </div>
        </div>
        <BattleTimer targetDate={endsAt} />
      </div>

      {/* Contestants */}
      <div className="flex gap-4">
        <ContestantCard
          contestant={challenger}
          side="left"
          isWinner={winnerId === challenger.id}
          voteCount={challenger.score}
          totalVotes={totalVotes}
          onVote={() => handleVote(challenger.id)}
          hasVoted={hasVoted}
        />
        <div className="flex items-center justify-center shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ type: 'spring', damping: 10, delay: 0.3 }}
            className="size-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg"
          >
            <Swords size={20} className="text-white" />
          </motion.div>
        </div>
        <ContestantCard
          contestant={challenged}
          side="right"
          isWinner={winnerId === challenged.id}
          voteCount={challenged.score}
          totalVotes={totalVotes}
          onVote={() => handleVote(challenged.id)}
          hasVoted={hasVoted}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <motion.div
          key={totalVotes}
          animate={animatingScore ? { scale: [1, 1.1, 1] } : {}}
          className="glass-card rounded-xl p-3 text-center border border-white/10"
        >
          <Heart size={16} className="text-red-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-foreground block tabular-nums">{formatNumber(totalVotes)}</span>
          <span className="text-[9px] text-muted-foreground">Total Votes</span>
        </motion.div>
        <div className="glass-card rounded-xl p-3 text-center border border-white/10">
          <Users size={16} className="text-primary-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-foreground block">
            {formatNumber(challenger.followers + challenged.followers)}
          </span>
          <span className="text-[9px] text-muted-foreground">Total Followers</span>
        </div>
        <div className="glass-card rounded-xl p-3 text-center border border-white/10">
          <TrendingUp size={16} className="text-green-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-foreground block">
            {((challenger.engagementRate + challenged.engagementRate) / 2).toFixed(1)}%
          </span>
          <span className="text-[9px] text-muted-foreground">Avg. Eng.</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="glass-card rounded-xl p-3 text-center border border-white/10 cursor-pointer hover:bg-glass-light transition-colors"
        >
          <Share2 size={16} className="text-accent-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-foreground block">Share</span>
          <span className="text-[9px] text-muted-foreground">Battle</span>
        </motion.button>
      </div>

      {/* Comments Section */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-3 border-b border-white/10">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <MessageCircle size={14} />
            Comments ({comments.length})
          </h4>
        </div>

        <div className="h-60 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle size={20} className="text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">No comments yet</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <Avatar
                    src={comment.userAvatar}
                    name={comment.userName}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">{comment.userName}</span>
                      <span className="text-[9px] text-muted-foreground">{timeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{comment.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(); }}
              className="flex-1 glass-input rounded-xl px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            <button
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
