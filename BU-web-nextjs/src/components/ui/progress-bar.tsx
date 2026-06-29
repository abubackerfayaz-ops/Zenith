'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const colorVariants = {
  primary: 'bg-primary-500',
  accent: 'bg-accent-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  premium: 'bg-gradient-to-r from-amber-500 via-primary-500 to-accent-500',
} as const;

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: keyof typeof colorVariants;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  showLabel = false,
  label,
  size = 'md',
  className,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-foreground/80">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-semibold text-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeStyles[size],
        )}
      >
        <motion.div
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', type: 'spring', damping: 20 }}
          className={cn('h-full rounded-full', colorVariants[color])}
        />
      </div>
    </div>
  );
}
