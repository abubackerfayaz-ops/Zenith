'use client';

import { useState, type ImgHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
  '3xl': 'w-28 h-28 text-2xl',
} as const;

const ringSizeMap = {
  xs: 'p-[1.5px]',
  sm: 'p-[2px]',
  md: 'p-[2.5px]',
  lg: 'p-[3px]',
  xl: 'p-[3px]',
  '2xl': 'p-[3.5px]',
  '3xl': 'p-[4px]',
} as const;

const indicatorSizeMap = {
  xs: 'w-1.5 h-1.5 right-0 top-0',
  sm: 'w-2 h-2 right-0 top-0',
  md: 'w-2.5 h-2.5 right-0 top-0',
  lg: 'w-3 h-3 right-0 top-0',
  xl: 'w-3 h-3 right-0 top-0',
  '2xl': 'w-3.5 h-3.5 right-0 top-0',
  '3xl': 'w-4 h-4 right-0 top-0',
} as const;

type AvatarSize = keyof typeof sizeMap;

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  isVerified?: boolean;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  className?: string;
  fallbackClassName?: string;
}

export function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  isVerified = false,
  showOnlineIndicator = false,
  isOnline = false,
  className,
  fallbackClassName,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !src || imgError;

  const content = (
    <div className={cn('relative shrink-0', className)}>
      {isVerified ? (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-amber-400 via-primary-500 to-accent-500',
            ringSizeMap[size],
          )}
        >
          <div className="rounded-full bg-background p-0.5">
            <div className={cn('avatar-base', sizeMap[size])}>
              {renderContent()}
            </div>
          </div>
        </div>
      ) : (
        <div className={cn('avatar-base', sizeMap[size])}>
          {renderContent()}
        </div>
      )}

      {showOnlineIndicator && (
        <span
          className={cn(
            'absolute block rounded-full border-2 border-background',
            indicatorSizeMap[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400',
          )}
        />
      )}
    </div>
  );

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex"
    >
      {content}
    </motion.div>
  );

  function renderContent() {
    if (showFallback) {
      return (
        <span
          className={cn(
            'flex items-center justify-center w-full h-full font-semibold text-muted-foreground',
            fallbackClassName,
          )}
        >
          {name ? getInitials(name) : <User size={size === 'xs' ? 10 : size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 18 : 22} />}
        </span>
      );
    }

    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className="w-full h-full object-cover rounded-full"
        onError={() => setImgError(true)}
        loading="lazy"
        {...props}
      />
    );
  }
}
