'use client';

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  floatingLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      icon,
      rightIcon,
      floatingLabel = false,
      type,
      id,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="space-y-1.5">
        {label && !floatingLabel && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground/80"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            placeholder={floatingLabel ? ' ' : placeholder}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              'glass-input w-full transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              icon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              floatingLabel && 'pt-5 pb-2',
              className,
            )}
            {...props}
          />

          {floatingLabel && (
            <motion.label
              htmlFor={inputId}
              animate={{
                y: isFocused || props.value ? -12 : 0,
                scale: isFocused || props.value ? 0.8 : 1,
                color:
                  error
                    ? 'rgb(239 68 68)'
                    : isFocused
                      ? 'rgb(14 165 233)'
                      : 'rgb(156 163 175)',
              }}
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground origin-left',
              )}
            >
              {label}
            </motion.label>
          )}

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-xs text-red-500 mt-1"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
