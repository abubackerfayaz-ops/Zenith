'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantStyles = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-500/25',
  secondary:
    'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-lg shadow-accent-500/25',
  outline:
    'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white active:bg-primary-600',
  ghost:
    'text-foreground hover:bg-glass-light active:bg-glass-medium',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-lg shadow-red-500/25',
  glass:
    'glass-button text-foreground border border-white/10 hover:bg-glass-medium active:scale-[0.98]',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  icon: 'h-10 w-10 p-0',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="absolute animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />
        )}
        <span className={cn('flex items-center gap-2', isLoading && 'invisible')}>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
