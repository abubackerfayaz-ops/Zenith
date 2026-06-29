'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeVariants = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-4xl',
} as const;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: keyof typeof sizeVariants;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  className?: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
};

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  closeOnOverlay = true,
  className,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="modal-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeOnOverlay ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            key="modal-content"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative w-full glass-heavy rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar',
              sizeVariants[size],
              className,
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                {title && (
                  <h2 className="text-lg font-semibold text-foreground">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1.5 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            <div className={cn('p-4', className)}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
