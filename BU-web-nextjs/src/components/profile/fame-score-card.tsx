'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Lightbulb,
  Target,
  Zap,
  Crown,
  Star,
  Flame,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import type { FameScore, FameTier } from '@/types';

interface FameScoreCardProps {
  fameScore: FameScore;
  className?: string;
}

const TIER_CONFIG: Record<FameTier, { label: string; color: string; icon: typeof Crown }> = {
  bronze: { label: 'Bronze', color: 'text-fame-bronze', icon: Star },
  silver: { label: 'Silver', color: 'text-fame-silver', icon: Star },
  gold: { label: 'Gold', color: 'text-fame-gold', icon: Crown },
  platinum: { label: 'Platinum', color: 'text-fame-platinum', icon: Crown },
  diamond: { label: 'Diamond', color: 'text-fame-diamond', icon: Crown },
  legendary: { label: 'Legendary', color: 'text-fame-legendary', icon: Flame },
};

function CircularProgress({
  value,
  size = 140,
  strokeWidth = 8,
  label,
  sublabel,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [progress, setProgress] = useState(0);
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(clampedValue), 100);
    return () => clearTimeout(timer);
  }, [clampedValue]);

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#fame-score-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={false}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="fame-score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="text-3xl sm:text-4xl font-black text-foreground tabular-nums"
        >
          {Math.round(progress)}
        </motion.span>
        {sublabel && (
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function FameScoreCard({ fameScore, className }: FameScoreCardProps) {
  const tier = TIER_CONFIG[fameScore.tier];
  const TierIcon = tier.icon;
  const totalScore = Math.min(fameScore.total, 100);
  const breakdown = fameScore.breakdown;

  const stats = [
    { label: 'Rank', value: `#${formatNumber(fameScore.rank)}`, icon: Crown },
    { label: 'Engagement', value: `${Math.round(breakdown.engagement)}%`, icon: TrendingUp },
    { label: 'Popularity', value: `${Math.round(breakdown.popularity)}%`, icon: Users },
    { label: 'Influence', value: `${Math.round(breakdown.influence)}%`, icon: Lightbulb },
    { label: 'Creativity', value: `${Math.round(breakdown.creativity)}%`, icon: Zap },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl',
        'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'border border-white/10 shadow-xl',
        className,
      )}
    >
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-500/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-primary-500" />
            <h3 className="text-lg font-bold text-foreground">Fame Score</h3>
          </div>
          <Badge variant="premium" icon={<TierIcon size={10} className={tier.color} />}>
            {tier.label}
          </Badge>
        </div>

        {/* Circular Score */}
        <div className="flex justify-center mb-6">
          <CircularProgress
            value={totalScore}
            label={`${Math.round(totalScore)}`}
            sublabel={`Rank #${formatNumber(fameScore.rank)}`}
          />
        </div>

        {/* Score Bars */}
        <div className="space-y-3 mb-6">
          <ScoreBar
            label="Engagement"
            value={breakdown.engagement}
            icon={<TrendingUp size={14} />}
            color="primary"
          />
          <ScoreBar
            label="Popularity"
            value={breakdown.popularity}
            icon={<Users size={14} />}
            color="accent"
          />
          <ScoreBar
            label="Consistency"
            value={breakdown.consistency}
            icon={<Target size={14} />}
            color="warning"
          />
          <ScoreBar
            label="Influence"
            value={breakdown.influence}
            icon={<Lightbulb size={14} />}
            color="success"
          />
          <ScoreBar
            label="Creativity"
            value={breakdown.creativity}
            icon={<Zap size={14} />}
            color="premium"
          />
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-5 gap-2">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ y: -1 }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5"
              >
                <StatIcon size={12} className="text-primary-500/70" />
                <span className="text-[10px] font-bold text-foreground tabular-nums">
                  {stat.value}
                </span>
                <span className="text-[8px] text-muted-foreground text-center leading-tight">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreBar({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'accent' | 'success' | 'warning' | 'premium';
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">
        <ProgressBar
          value={value}
          max={100}
          label={label}
          showLabel
          color={color}
          size="sm"
        />
      </div>
    </div>
  );
}
