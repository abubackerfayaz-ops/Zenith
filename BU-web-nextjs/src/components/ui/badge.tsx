'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-500/15 text-primary-700 dark:text-primary-300',
  success: 'bg-green-500/15 text-green-700 dark:text-green-300',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-500/15 text-red-700 dark:text-red-300',
  premium:
    'bg-gradient-to-r from-amber-500/20 via-primary-500/20 to-accent-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30',
};

interface BadgeProps {
  children: ReactNode;
  variant?: keyof typeof variantStyles;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Badge({
  children,
  variant = 'default',
  icon,
  className,
  onClick,
}: BadgeProps) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:opacity-80 active:scale-95',
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </Component>
  );
}
