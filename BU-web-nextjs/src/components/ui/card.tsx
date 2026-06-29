'use client';

import type { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const paddingVariants = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof paddingVariants;
  glass?: boolean;
  hoverable?: boolean;
  interactive?: boolean;
}

export function Card({
  className,
  children,
  padding = 'md',
  glass = false,
  hoverable = false,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { scale: 1.01, y: -2 } : hoverable ? { y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={cn(
        'rounded-xl transition-all duration-200',
        glass
          ? 'glass-card'
          : 'bg-card border border-border shadow-sm',
        hoverable && 'hover:shadow-md hover:border-primary-500/30',
        interactive && 'cursor-pointer hover:shadow-md hover:border-primary-500/30 active:scale-[0.99]',
        paddingVariants[padding],
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
