'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Heart,
  BarChart3,
  FileText,
  Flame,
  TrendingUp,
  Target,
  Zap,
  Star,
  Award,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';

type PersonalityType = 'Entrepreneur' | 'Artist' | 'Comedian' | 'Influencer' | 'Educator' | 'Creator' | 'Innovator';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
  followers: number;
  fameScore: number;
  engagementRate: number;
  totalPosts: number;
  personalityType?: PersonalityType;
  level: string;
  viralScore: number;
}

interface ComparisonCardProps {
  user1: UserProfile;
  user2: UserProfile;
  className?: string;
}

const personalityIcons: Record<PersonalityType, string> = {
  Entrepreneur: '💼',
  Artist: '🎨',
  Comedian: '😂',
  Influencer: '🌟',
  Educator: '📚',
  Creator: '✨',
  Innovator: '💡',
};

function ComparisonBar({
  label,
  value1,
  value2,
  icon,
  format = 'number',
}: {
  label: string;
  value1: number;
  value2: number;
  icon: React.ReactNode;
  format?: 'number' | 'percentage';
}) {
  const max = Math.max(value1, value2, 1);
  const pct1 = (value1 / max) * 100;
  const pct2 = (value2 / max) * 100;

  const formatVal = (v: number) =>
    format === 'percentage' ? `${v.toFixed(1)}%` : formatNumber(v);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-foreground w-16 text-right tabular-nums">
          {formatVal(value1)}
        </span>
        <div className="flex-1 relative h-7">
          {/* Overlap bar container */}
          <div className="absolute inset-0 flex items-center">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct1}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-l-full bg-gradient-to-r from-primary-500 to-accent-500"
                style={{ zIndex: 2, position: 'relative' }}
              />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-end">
            <div className="w-1/2 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct2}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className="h-full rounded-r-full bg-gradient-to-r from-accent-500 to-pink-500 ml-auto"
              />
            </div>
          </div>
        </div>
        <span className="text-sm font-bold text-foreground w-16 tabular-nums">
          {formatVal(value2)}
        </span>
      </div>
    </div>
  );
}

export function ComparisonCard({
  user1,
  user2,
  className,
}: ComparisonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card rounded-2xl border border-white/10 p-5 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-primary-500" />
          <h3 className="text-sm font-bold text-foreground">Profile Comparison</h3>
        </div>
        <Badge variant="glass">Side by Side</Badge>
      </div>

      {/* User Headers */}
      <div className="flex items-center gap-4 mb-6">
        {/* User 1 */}
        <div className="flex-1 flex flex-col items-center text-center">
          <Avatar
            src={user1.avatarUrl}
            name={user1.name}
            size="2xl"
            isVerified={user1.isVerified}
          />
          <span className="text-sm font-bold text-foreground mt-2">{user1.name}</span>
          <span className="text-[10px] text-muted-foreground">@{user1.username}</span>
          <Badge variant="premium" className="mt-1 text-[9px]">
            {user1.level}
          </Badge>
          {user1.personalityType && (
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {personalityIcons[user1.personalityType]} {user1.personalityType}
            </span>
          )}
        </div>

        {/* VS Divider */}
        <div className="shrink-0">
          <div className="size-10 rounded-full bg-gradient-to-br from-primary-500 via-accent-500 to-pink-500 flex items-center justify-center">
            <span className="text-xs font-black text-white">VS</span>
          </div>
        </div>

        {/* User 2 */}
        <div className="flex-1 flex flex-col items-center text-center">
          <Avatar
            src={user2.avatarUrl}
            name={user2.name}
            size="2xl"
            isVerified={user2.isVerified}
          />
          <span className="text-sm font-bold text-foreground mt-2">{user2.name}</span>
          <span className="text-[10px] text-muted-foreground">@{user2.username}</span>
          <Badge variant="premium" className="mt-1 text-[9px]">
            {user2.level}
          </Badge>
          {user2.personalityType && (
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {personalityIcons[user2.personalityType]} {user2.personalityType}
            </span>
          )}
        </div>
      </div>

      {/* Comparison Bars */}
      <div className="space-y-3">
        <ComparisonBar
          label="Followers"
          value1={user1.followers}
          value2={user2.followers}
          icon={<Users size={12} />}
        />
        <ComparisonBar
          label="Fame Score"
          value1={user1.fameScore}
          value2={user2.fameScore}
          icon={<Flame size={12} />}
        />
        <ComparisonBar
          label="Engagement Rate"
          value1={user1.engagementRate}
          value2={user2.engagementRate}
          icon={<TrendingUp size={12} />}
          format="percentage"
        />
        <ComparisonBar
          label="Total Posts"
          value1={user1.totalPosts}
          value2={user2.totalPosts}
          icon={<FileText size={12} />}
        />
        <ComparisonBar
          label="Viral Score"
          value1={user1.viralScore}
          value2={user2.viralScore}
          icon={<Zap size={12} />}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
        <div className="text-center p-2 rounded-xl bg-white/5">
          <span className="text-xs font-bold text-foreground block">
            {user1.fameScore > user2.fameScore ? user1.name : user2.name}
          </span>
          <Badge variant="success" className="text-[9px]">
            Higher Fame Score
          </Badge>
        </div>
        <div className="text-center p-2 rounded-xl bg-white/5">
          <span className="text-xs font-bold text-foreground block">
            {user1.engagementRate > user2.engagementRate ? user1.name : user2.name}
          </span>
          <Badge variant="success" className="text-[9px]">
            Better Engagement
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
