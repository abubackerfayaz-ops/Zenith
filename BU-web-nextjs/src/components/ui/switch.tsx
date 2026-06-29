'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className,
  id,
}: SwitchProps) {
  const switchId = id || `switch-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <div className="relative">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <motion.div
          animate={{ backgroundColor: checked ? 'rgb(14 165 233)' : 'rgb(75 85 99 / 0.4)' }}
          transition={{ duration: 0.2 }}
          className={cn(
            'w-11 h-6 rounded-full transition-colors',
            'border border-white/10',
          )}
        >
          <motion.div
            animate={{ x: checked ? 20 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'size-5 rounded-full shadow-md mt-0.5 ml-0.5',
              checked
                ? 'bg-white'
                : 'bg-gray-400',
            )}
          />
        </motion.div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-foreground">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
