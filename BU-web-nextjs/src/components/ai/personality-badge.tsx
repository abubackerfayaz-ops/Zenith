'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  Palette,
  Laugh,
  Users,
  GraduationCap,
  Sparkles,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PersonalityType = 'Entrepreneur' | 'Artist' | 'Comedian' | 'Influencer' | 'Educator' | 'Creator' | 'Innovator';

interface PersonalityBadgeProps {
  type: PersonalityType;
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
  onClick?: () => void;
  className?: string;
}

const typeConfig: Record<PersonalityType, { icon: LucideIcon; gradient: string; description: string }> = {
  Entrepreneur: {
    icon: Briefcase,
    gradient: 'from-amber-500 to-orange-600',
    description: 'Strategic thinker, built for business',
  },
  Artist: {
    icon: Palette,
    gradient: 'from-purple-500 to-pink-600',
    description: 'Creative soul with unique vision',
  },
  Comedian: {
    icon: Laugh,
    gradient: 'from-yellow-400 to-orange-500',
    description: 'Natural humor and entertainment',
  },
  Influencer: {
    icon: Users,
    gradient: 'from-pink-500 to-rose-600',
    description: 'Born to inspire and connect',
  },
  Educator: {
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-600',
    description: 'Knowledge sharer and mentor',
  },
  Creator: {
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-600',
    description: 'Content crafting expert',
  },
  Innovator: {
    icon: Lightbulb,
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Pushing boundaries forward',
  },
};

const sizeMap = {
  sm: { container: 'px-2.5 py-1 text-xs gap-1', icon: 12, dot: 'size-1.5' },
  md: { container: 'px-3 py-1.5 text-sm gap-1.5', icon: 14, dot: 'size-2' },
  lg: { container: 'px-4 py-2 text-base gap-2', icon: 18, dot: 'size-2.5' },
};

export function PersonalityBadge({
  type,
  confidence,
  size = 'md',
  showConfidence = true,
  onClick,
  className,
}: PersonalityBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const s = sizeMap[size];

  const content = (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center rounded-full font-medium text-white shadow-lg transition-all',
        'bg-gradient-to-r',
        config.gradient,
        s.container,
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <Icon size={s.icon} className="shrink-0" />
      <span>{type}</span>
      {showConfidence && (
        <span className={cn('rounded-full bg-white/20 flex items-center justify-center', s.dot, 'ml-0.5')}>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn('rounded-full bg-white', s.dot === 'size-1.5' ? 'size-1' : s.dot === 'size-2' ? 'size-1.5' : 'size-2')}
          />
        </span>
      )}
    </motion.div>
  );

  if (onClick) {
    return <button onClick={onClick} className="inline-flex">{content}</button>;
  }

  return content;
}

export function PersonalityBadgeCard({
  type,
  confidence,
  className,
}: PersonalityBadgeProps & { className?: string }) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 border border-white/10 cursor-pointer',
        'bg-gradient-to-br',
        config.gradient.replace('from-', 'from-').replace('to-', 'to-').replace(/\w+-\d+/g, (m) => m + '/15'),
        className,
      )}
    >
      <div className="relative z-10">
        <div className={cn(
          'size-10 rounded-xl flex items-center justify-center mb-3',
          'bg-gradient-to-br',
          config.gradient,
        )}>
          <Icon size={20} className="text-white" />
        </div>
        <h4 className="text-sm font-bold text-foreground">{type}</h4>
        <p className="text-[10px] text-muted-foreground mt-0.5">{config.description}</p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="h-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mt-3"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">Confidence</span>
          <span className="text-[9px] font-bold text-foreground">{confidence.toFixed(0)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
