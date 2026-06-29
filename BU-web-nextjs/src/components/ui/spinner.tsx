'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const sizeMap = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
  xl: 'size-10',
} as const;

const colorMap = {
  primary: 'border-primary-500',
  accent: 'border-accent-500',
  white: 'border-white',
  muted: 'border-muted-foreground',
};

interface SpinnerProps {
  size?: keyof typeof sizeMap;
  color?: keyof typeof colorMap;
  className?: string;
}

export function Spinner({
  size = 'md',
  color = 'primary',
  className,
}: SpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      className={cn(
        'rounded-full border-2 border-t-transparent',
        sizeMap[size],
        colorMap[color],
        className,
      )}
    />
  );
}
