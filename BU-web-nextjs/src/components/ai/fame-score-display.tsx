'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  BarChart3,
  Target,
  Zap,
  Star,
  Users,
  Sparkles,
  Flame,
  Crown,
  Award,
  Rocket,
  Layers,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';

type CreatorLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';

interface ScoreBreakdown {
  viralPotential: number;
  engagement: number;
  consistency: number;
  contentQuality: number;
  audienceGrowth: number;
  influence: number;
}

interface PersonalityBadgeData {
  id: string;
  name: string;
  icon: string;
  confidence: number;
}

interface FameScoreData {
  total: number;
  level: CreatorLevel;
  xp: number;
  xpToNextLevel: number;
  breakdown: ScoreBreakdown;
  personalityBadges: PersonalityBadgeData[];
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    avgEngagementRate: number;
  };
}

interface FameScoreDisplayProps {
  data: FameScoreData;
  isLoading?: boolean;
  className?: string;
}

const levelConfig: Record<CreatorLevel, { label: string; icon: typeof Crown; color: string; gradient: string; minScore: number }> = {
  bronze: { label: 'Bronze', icon: Star, color: 'text-fame-bronze', gradient: 'from-amber-700/30 to-amber-600/10', minScore: 0 },
  silver: { label: 'Silver', icon: Award, color: 'text-fame-silver', gradient: 'from-gray-400/30 to-gray-300/10', minScore: 1000 },
  gold: { label: 'Gold', icon: Crown, color: 'text-fame-gold', gradient: 'from-yellow-500/30 to-amber-500/10', minScore: 5000 },
  platinum: { label: 'Platinum', icon: Crown, color: 'text-fame-platinum', gradient: 'from-cyan-400/30 to-blue-500/10', minScore: 15000 },
  diamond: { label: 'Diamond', icon: DiamondIcon, color: 'text-fame-diamond', gradient: 'from-sky-400/30 to-indigo-500/10', minScore: 50000 },
  legendary: { label: 'Legendary', icon: Flame, color: 'text-fame-legendary', gradient: 'from-orange-500/30 via-red-500/20 to-purple-600/10', minScore: 100000 },
};

function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8l4-4h12l4 4-10 12L2 8z" />
    </svg>
  );
}

function CircularScore({ value, size = 140, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [progress, setProgress] = useState(0);
  const clampedValue = Math.min(Math.max(value, 0), 100);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(clampedValue), 200);
    return () => clearTimeout(timer);
  }, [clampedValue]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="fame-display-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="35%" stopColor="#a855f7" />
            <stop offset="70%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#fame-display-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={false}
          transition={{ duration: 2, ease: 'easeOut' }}
          filter="url(#glow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', damping: 12 }}
          className="text-3xl sm:text-4xl font-black text-foreground tabular-nums"
        >
          {Math.round(progress)}
        </motion.span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Fame Score</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/5 border border-white/5"
    >
      <span className={color}>{icon}</span>
      <span className="text-xs font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[8px] text-muted-foreground text-center leading-tight">{label}</span>
    </motion.div>
  );
}

export function FameScoreDisplay({
  data,
  isLoading = false,
  className,
}: FameScoreDisplayProps) {
  const levelInfo = levelConfig[data.level];
  const LevelIcon = levelInfo.icon;
  const xpPercentage = data.xpToNextLevel > 0 ? (data.xp / data.xpToNextLevel) * 100 : 100;

  if (isLoading) {
    return (
      <div className={cn('glass-card rounded-2xl border border-white/10 p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="flex justify-center">
            <div className="size-36 bg-muted rounded-full" />
          </div>
          <div className="h-4 w-1/2 bg-muted rounded mx-auto" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-3 bg-muted rounded" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden glass-card rounded-2xl border border-white/10 p-6',
        className,
      )}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${levelInfo.gradient} opacity-50`} />
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-36 h-36 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-primary-500" />
            <h3 className="text-lg font-bold text-foreground">Fame Score</h3>
          </div>
          <Badge variant="premium" icon={<LevelIcon size={10} className={levelInfo.color} />}>
            {levelInfo.label}
          </Badge>
        </div>

        {/* Circular Score */}
        <div className="flex justify-center">
          <CircularScore value={data.total} />
        </div>

        {/* Creator Level & XP */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <LevelIcon size={16} className={levelInfo.color} />
            <span className={cn('text-sm font-bold', levelInfo.color)}>
              {levelInfo.label} Creator
            </span>
          </div>
          <div className="max-w-xs mx-auto">
            <ProgressBar
              value={data.xp}
              max={data.xpToNextLevel}
              label="XP to next level"
              showLabel
              color="premium"
              size="sm"
            />
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-2.5">
          <ScoreBreakdownRow
            label="Viral Potential"
            value={data.breakdown.viralPotential}
            icon={<Zap size={14} />}
            color="premium"
          />
          <ScoreBreakdownRow
            label="Engagement"
            value={data.breakdown.engagement}
            icon={<Heart size={14} />}
            color="primary"
          />
          <ScoreBreakdownRow
            label="Consistency"
            value={data.breakdown.consistency}
            icon={<Target size={14} />}
            color="warning"
          />
          <ScoreBreakdownRow
            label="Content Quality"
            value={data.breakdown.contentQuality}
            icon={<Sparkles size={14} />}
            color="success"
          />
          <ScoreBreakdownRow
            label="Audience Growth"
            value={data.breakdown.audienceGrowth}
            icon={<TrendingUp size={14} />}
            color="accent"
          />
          <ScoreBreakdownRow
            label="Influence"
            value={data.breakdown.influence}
            icon={<Users size={14} />}
            color="premium"
          />
        </div>

        {/* Personality Badges */}
        {data.personalityBadges.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Layers size={12} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Personality</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.personalityBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20"
                >
                  <span className="text-xs">{badge.icon}</span>
                  <span className="text-xs font-medium text-foreground">{badge.name}</span>
                  <span className="text-[9px] text-muted-foreground">{Math.round(badge.confidence)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={<BarChart3 size={14} />}
            label="Total Posts"
            value={formatNumber(data.stats.totalPosts)}
            color="text-primary-500"
          />
          <StatCard
            icon={<Heart size={14} />}
            label="Total Likes"
            value={formatNumber(data.stats.totalLikes)}
            color="text-red-500"
          />
          <StatCard
            icon={<MessageCircle size={14} />}
            label="Comments"
            value={formatNumber(data.stats.totalComments)}
            color="text-primary-500"
          />
          <StatCard
            icon={<Share2 size={14} />}
            label="Shares"
            value={formatNumber(data.stats.totalShares)}
            color="text-accent-500"
          />
          <StatCard
            icon={<Eye size={14} />}
            label="Views"
            value={formatNumber(data.stats.totalViews)}
            color="text-amber-500"
          />
          <StatCard
            icon={<Rocket size={14} />}
            label="Eng. Rate"
            value={`${data.stats.avgEngagementRate.toFixed(1)}%`}
            color="text-green-500"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ScoreBreakdownRow({
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
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2"
    >
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
    </motion.div>
  );
}
