'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Users,
  Hash,
  Star,
  Zap,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CompatibilityData {
  friendshipScore: number;
  interestCompatibility: number;
  collaborationPotential: number;
  commonInterests: string[];
  mutualFollowers: number;
  totalFollowers: number;
}

interface CompatibilityScoreProps {
  data: CompatibilityData;
  user1Name: string;
  user2Name: string;
  isLoading?: boolean;
  className?: string;
}

function CircularGauge({
  value,
  size = 100,
  strokeWidth = 6,
  label,
  gradientId,
  color,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  gradientId: string;
  color: string;
}) {
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
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
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
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={false}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="text-xl font-black text-foreground tabular-nums"
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight max-w-[80px]">
        {label}
      </span>
    </div>
  );
}

export function CompatibilityScore({
  data,
  user1Name,
  user2Name,
  isLoading = false,
  className,
}: CompatibilityScoreProps) {
  const overallScore = Math.round(
    (data.friendshipScore + data.interestCompatibility + data.collaborationPotential) / 3,
  );

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent Match!', color: 'text-green-500', icon: Sparkles };
    if (score >= 60) return { label: 'Great Match', color: 'text-primary-500', icon: Star };
    if (score >= 40) return { label: 'Good Match', color: 'text-amber-500', icon: Heart };
    return { label: 'Exploring', color: 'text-muted-foreground', icon: Users };
  };

  const scoreInfo = getScoreLabel(overallScore);
  const ScoreIcon = scoreInfo.icon;

  if (isLoading) {
    return (
      <div className={cn('glass-card rounded-2xl border border-white/10 p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="flex justify-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="size-24 bg-muted rounded-full" />
            ))}
          </div>
          <div className="h-4 w-1/2 bg-muted rounded mx-auto" />
          <div className="flex flex-wrap gap-2 justify-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-muted rounded-full" />
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
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart size={18} className="text-pink-500" />
            <h3 className="text-base font-bold text-foreground">Compatibility</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {user1Name} & {user2Name}
          </p>
        </div>

        {/* Circular Gauges */}
        <div className="flex justify-center gap-4 sm:gap-6">
          <CircularGauge
            value={data.friendshipScore}
            label="Friendship"
            gradientId="friendship-gradient"
            color="#ec4899"
          />
          <CircularGauge
            value={data.interestCompatibility}
            label="Interest Match"
            gradientId="interest-gradient"
            color="#f59e0b"
          />
          <CircularGauge
            value={data.collaborationPotential}
            label="Collab Potential"
            gradientId="collab-gradient"
            color="#10b981"
          />
        </div>

        {/* Overall Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.5 }}
          className="text-center"
        >
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full', scoreInfo.color, 'bg-white/5')}>
            <ScoreIcon size={16} />
            <span className="text-sm font-bold">{scoreInfo.label}</span>
          </div>
        </motion.div>

        {/* Common Interests */}
        {data.commonInterests.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Hash size={12} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Common Interests</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.commonInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant="primary"
                  className="text-[10px]"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Mutual Followers */}
        {data.mutualFollowers > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-primary-500" />
              <span className="text-xs text-foreground">Mutual Followers</span>
            </div>
            <Badge variant="success" className="text-xs">
              {data.mutualFollowers} / {data.totalFollowers}
            </Badge>
          </div>
        )}

        {/* Match Suggestions */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Suggestions
          </p>
          <ul className="space-y-1">
            <li className="flex items-start gap-2 text-xs text-foreground/80">
              <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
              <span>Collaborate on content together</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-foreground/80">
              <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
              <span>Share each other's posts to grow audience</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-foreground/80">
              <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
              <span>Engage with overlapping interests</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
