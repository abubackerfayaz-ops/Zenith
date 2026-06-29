'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  TrendingUp,
  Swords,
  Crown,
  Star,
  Flame,
  Award,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type PersonalityType = 'Entrepreneur' | 'Artist' | 'Comedian' | 'Influencer' | 'Educator' | 'Creator' | 'Innovator';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
  fameScore: number;
  level: string;
  personalityType?: PersonalityType;
  winCount: number;
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  onUserClick?: (userId: string) => void;
  onChallenge?: (userId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

const rankColors: Record<number, { bg: string; border: string; iconColor: string; icon: typeof Trophy }> = {
  1: { bg: 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-transparent', border: 'border-yellow-500/30', iconColor: 'text-yellow-500', icon: Crown },
  2: { bg: 'bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-transparent', border: 'border-gray-400/30', iconColor: 'text-gray-400', icon: Medal },
  3: { bg: 'bg-gradient-to-r from-amber-700/20 via-amber-600/10 to-transparent', border: 'border-amber-700/30', iconColor: 'text-amber-700', icon: Medal },
};

const personalityIcons: Record<PersonalityType, string> = {
  Entrepreneur: '💼',
  Artist: '🎨',
  Comedian: '😂',
  Influencer: '🌟',
  Educator: '📚',
  Creator: '✨',
  Innovator: '💡',
};

function PodiumCard({ user, position, onUserClick }: { user: LeaderboardUser; position: 1 | 2 | 3; onUserClick?: (id: string) => void }) {
  const rankCfg = rankColors[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (position - 1) * 0.15, type: 'spring', damping: 15 }}
      whileHover={{ y: -4 }}
      onClick={() => onUserClick?.(user.id)}
      className={cn(
        'flex-1 flex flex-col items-center text-center p-4 rounded-2xl border cursor-pointer transition-all',
        rankCfg.bg,
        rankCfg.border,
        position === 1 ? 'pt-8' : position === 2 ? 'pt-6' : 'pt-6',
      )}
    >
      <div className={cn('p-2 rounded-full bg-glass-light mb-2', rankCfg.iconColor)}>
        <rankCfg.icon size={position === 1 ? 20 : 16} />
      </div>
      <Avatar
        src={user.avatarUrl}
        name={user.name}
        size={position === 1 ? '2xl' : 'xl'}
        isVerified={user.isVerified}
      />
      <span className="text-sm font-bold text-foreground mt-2 truncate max-w-full">
        {user.name}
      </span>
      <span className="text-[10px] text-muted-foreground">@{user.username}</span>
      <div className="flex items-center gap-1.5 mt-2">
        <Flame size={12} className="text-primary-500" />
        <span className="text-lg font-black text-foreground tabular-nums">
          {user.fameScore}
        </span>
      </div>
      <Badge variant="premium" className="mt-2">{user.level}</Badge>
      {user.personalityType && (
        <span className="text-xs mt-1">
          {personalityIcons[user.personalityType]} {user.personalityType}
        </span>
      )}
    </motion.div>
  );
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
};

export function LeaderboardTable({
  users,
  currentUserId,
  onUserClick,
  onChallenge,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: LeaderboardTableProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const topThree = users.filter((u) => u.rank <= 3);
  const rest = users.filter((u) => u.rank > 3);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasMore || isLoading) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      onLoadMore?.();
    }
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" />
          <h2 className="text-lg font-bold text-foreground">Leaderboard</h2>
        </div>
        <Badge variant="primary">{users.length} creators</Badge>
      </div>

      {/* Podium */}
      {topThree.length > 0 && (
        <div className="flex gap-3 items-end">
          {/* 2nd */}
          {topThree[1] && (
            <PodiumCard user={topThree[1]} position={2} onUserClick={onUserClick} />
          )}
          {/* 1st */}
          {topThree[0] && (
            <PodiumCard user={topThree[0]} position={1} onUserClick={onUserClick} />
          )}
          {/* 3rd */}
          {topThree[2] && (
            <PodiumCard user={topThree[2]} position={3} onUserClick={onUserClick} />
          )}
        </div>
      )}

      {/* Rest of Leaderboard */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="glass-card rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {rest.length === 0 && topThree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy size={32} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No rankings yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {isLoading && users.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                [...topThree.slice(3), ...rest].map((user, i) => {
                  const isCurrentUser = user.id === currentUserId;

                  return (
                    <motion.div
                      key={user.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                      onClick={() => onUserClick?.(user.id)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer',
                        isCurrentUser && 'bg-primary-500/5',
                      )}
                    >
                      {/* Rank */}
                      <div className="w-8 text-center shrink-0">
                        {user.rank <= 3 ? (
                          <Medal size={16} className={cn('mx-auto', rankColors[user.rank]?.iconColor || 'text-muted-foreground')} />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground tabular-nums">
                            #{user.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="md"
                        isVerified={user.isVerified}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {user.name}
                          </span>
                          {user.isVerified && (
                            <Badge variant="primary" className="text-[8px] px-1 py-0">✓</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>@{user.username}</span>
                          {user.personalityType && (
                            <>
                              <span>·</span>
                              <span>{personalityIcons[user.personalityType]} {user.personalityType}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs font-bold text-foreground tabular-nums">{user.fameScore}</span>
                          <span className="text-[9px] text-muted-foreground block">Score</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-foreground tabular-nums">{user.winCount}</span>
                          <span className="text-[9px] text-muted-foreground block">Wins</span>
                        </div>
                      </div>

                      {/* Action */}
                      <Button
                        variant="glass"
                        size="sm"
                        leftIcon={<Swords size={12} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChallenge?.(user.id);
                        }}
                        className="shrink-0"
                      >
                        Challenge
                      </Button>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Loading More */}
        {isLoading && users.length > 0 && (
          <div className="flex justify-center py-3 border-t border-white/10">
            <Spinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
