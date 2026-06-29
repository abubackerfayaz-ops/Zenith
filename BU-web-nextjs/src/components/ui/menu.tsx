'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface MenuSection {
  items: MenuItem[];
}

interface MenuProps {
  trigger: ReactNode;
  sections?: MenuSection[];
  items?: MenuItem[];
  align?: 'start' | 'end';
  className?: string;
  menuClassName?: string;
}

export function Menu({
  trigger,
  sections,
  items,
  align = 'end',
  className,
  menuClassName,
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const menuItems = items || sections?.flatMap((s) => s.items) || [];

  return (
    <div ref={menuRef} className={cn('relative inline-block', className)}>
      <div onClick={() => !menuItems.every((i) => i.disabled) && setIsOpen(!isOpen)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] glass-heavy rounded-xl shadow-2xl border border-white/10 overflow-hidden',
              align === 'end' ? 'right-0' : 'left-0',
              menuClassName,
            )}
          >
            {sections ? (
              sections.map((section, idx) => (
                <div key={idx}>
                  {idx > 0 && <div className="divider my-1" />}
                  {section.items.map((item) => (
                    <MenuItemComponent key={item.id} item={item} onClose={() => setIsOpen(false)} />
                  ))}
                </div>
              ))
            ) : (
              menuItems.map((item) => (
                <MenuItemComponent key={item.id} item={item} onClose={() => setIsOpen(false)} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItemComponent({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  return (
    <button
      disabled={item.disabled}
      onClick={() => {
        if (!item.disabled) {
          item.onClick?.();
          onClose();
        }
      }}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
        item.danger
          ? 'text-red-500 hover:bg-red-500/10'
          : 'text-foreground hover:bg-glass-light',
        item.disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {item.icon && <span className="shrink-0 size-4">{item.icon}</span>}
      {item.label}
    </button>
  );
}
