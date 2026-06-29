'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, Users, Trophy, Zap, Award } from 'lucide-react';
import { cn, formatNumber, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type BattleStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

interface BattleContestant {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
  score: number;
  fameScore: number;
}

interface BattleCardProps {
  id: string;
  title: string;
  description?: string;
  challenger: BattleContestant;
  challenged: BattleContestant;
  prize: string;
  status: BattleStatus;
  endsAt: string;
  voteCount: number;
  category?: string;
  winnerId?: string;
  onVote?: (battleId: string, contestantId: string) => void;
  onClick?: (battleId: string) => void;
  hasVoted?: boolean;
  className?: string;
}

const statusConfig: Record<BattleStatus, { label: string; color: string; bg: string }> = {
  upcoming: { label: 'Upcoming', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  active: { label: 'Live', color: 'text-green-500', bg: 'bg-green-500/10' },
  completed: { label: 'Ended', color: 'text-muted-foreground', bg: 'bg-glass-light' },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10' },
};

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft('Ended');
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else if (m > 0) setTimeLeft(`${m}m ${s}s`);
      else setTimeLeft(`${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className="tabular-nums">{timeLeft}</span>
  );
}

export function BattleCard({
  id,
  title,
  description,
  challenger,
  challenged,
  prize,
  status,
  endsAt,
  voteCount,
  category,
  winnerId,
  onVote,
  onClick,
  hasVoted = false,
  className,
}: BattleCardProps) {
  const config = statusConfig[status];
  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  const totalScore = challenger.score + challenged.score;
  const challengerPct = totalScore > 0 ? (challenger.score / totalScore) * 100 : 50;
  const challengedPct = totalScore > 0 ? (challenged.score / totalScore) * 100 : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -2, scale: 1.005 } : undefined}
      onClick={() => onClick?.(id)}
      className={cn(
        'relative overflow-hidden glass-card rounded-2xl border border-white/10 p-5',
        'transition-all duration-200',
        onClick && 'cursor-pointer',
        hasVoted && 'border-primary-500/30',
        className,
      )}
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full', config.bg)}>
          {status === 'active' && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="size-1.5 rounded-full bg-green-500"
            />
          )}
          <Swords size={12} className={config.color} />
          <span className={cn('text-[10px] font-semibold', config.color)}>{config.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Users size={10} />
          <span>{formatNumber(voteCount)} votes</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-foreground mb-3">{title}</h4>

      {/* Contestants */}
      <div className="flex items-center gap-3 mb-4">
        {/* Challenger */}
        <div className="flex-1 flex flex-col items-center text-center">
          <Avatar
            src={challenger.avatarUrl}
            name={challenger.name}
            size="lg"
            isVerified={challenger.isVerified}
          />
          <span className="text-xs font-semibold text-foreground mt-1.5 truncate max-w-full">
            {challenger.name}
          </span>
          <span className="text-[10px] text-muted-foreground">@{challenger.username}</span>
          {isCompleted && winnerId === challenger.id && (
            <Badge variant="premium" icon={<Trophy size={8} />} className="mt-1">
              Winner
            </Badge>
          )}
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1">
          <div className="size-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <span className="text-xs font-black text-white">VS</span>
          </div>
        </div>

        {/* Challenged */}
        <div className="flex-1 flex flex-col items-center text-center">
          <Avatar
            src={challenged.avatarUrl}
            name={challenged.name}
            size="lg"
            isVerified={challenged.isVerified}
          />
          <span className="text-xs font-semibold text-foreground mt-1.5 truncate max-w-full">
            {challenged.name}
          </span>
          <span className="text-[10px] text-muted-foreground">@{challenged.username}</span>
          {isCompleted && winnerId === challenged.id && (
            <Badge variant="premium" icon={<Trophy size={8} />} className="mt-1">
              Winner
            </Badge>
          )}
        </div>
      </div>

      {/* Score Bar */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-foreground tabular-nums w-10 text-right">
          {formatNumber(challenger.score)}
        </span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${challengerPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-l-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${challengedPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent-500 to-pink-500 rounded-r-full"
          />
        </div>
        <span className="text-xs font-bold text-foreground tabular-nums w-10">
          {formatNumber(challenged.score)}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Zap size={10} />
            <span>{prize}</span>
          </div>
          {category && (
            <Badge variant="default" className="text-[8px] px-1.5 py-0">
              {category}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock size={10} />
          <CountdownTimer targetDate={endsAt} />
        </div>
      </div>

      {/* Vote Button */}
      {isActive && !hasVoted && (
        <div className="mt-3">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={<Zap size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onVote?.(id, challenger.id);
            }}
          >
            Vote Now
          </Button>
        </div>
      )}
    </motion.div>
  );
}
