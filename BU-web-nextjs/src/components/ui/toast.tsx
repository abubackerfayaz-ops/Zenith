'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  className?: string;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-primary-500',
};

const bgIconMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-primary-500',
};

export function ToastContainer({ toasts, onDismiss, className }: ToastProps) {
  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none',
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'pointer-events-auto glass-heavy rounded-xl border-l-4 shadow-2xl overflow-hidden',
                colorMap[toast.type],
              )}
            >
              <div className="flex items-start gap-3 p-4">
                <Icon
                  size={20}
                  className={cn('shrink-0 mt-0.5', bgIconMap[toast.type])}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="shrink-0 p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToastState() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastData, 'id'> & { id?: string }) => {
      const id = toast.id || Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
