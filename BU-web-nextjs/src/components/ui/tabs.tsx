'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'glass' | 'pills';
  className?: string;
}

const variants = {
  underline: {
    container: 'border-b border-border',
    tab: 'pb-3',
    active: 'text-primary-500',
    indicator: 'h-0.5 bg-primary-500 rounded-full',
  },
  glass: {
    container: 'glass p-1 rounded-xl',
    tab: 'py-2 px-4 rounded-lg',
    active: 'text-foreground',
    indicator: 'bg-glass-heavy rounded-lg',
  },
  pills: {
    container: 'flex-wrap gap-2',
    tab: 'py-1.5 px-4 rounded-full border border-border',
    active: 'text-primary-500 border-primary-500 bg-primary-500/10',
    indicator: '',
  },
};

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onChange,
  variant = 'underline',
  className,
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id);
  const currentTab = controlledTab ?? internalTab;

  const handleChange = (tabId: string) => {
    if (controlledTab === undefined) {
      setInternalTab(tabId);
    }
    onChange?.(tabId);
  };

  const v = variants[variant];

  return (
    <div className={cn('flex relative', v.container, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.disabled}
          onClick={() => handleChange(tab.id)}
          className={cn(
            'relative flex items-center gap-2 text-sm font-medium transition-colors duration-200',
            v.tab,
            tab.disabled && 'opacity-40 cursor-not-allowed',
            currentTab === tab.id
              ? v.active
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-primary-500/20 text-primary-500">
              {tab.badge}
            </span>
          )}
          {variant === 'underline' && currentTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className={cn('absolute bottom-0 left-0 right-0', v.indicator)}
            />
          )}
        </button>
      ))}

      {variant === 'glass' && (
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {tabs
              .filter((t) => t.id === currentTab)
              .map((tab) => (
                <motion.div
                  key={tab.id}
                  layoutId="tab-indicator"
                  className={cn('absolute inset-0', v.indicator)}
                  style={{ width: `${100 / tabs.length}%` }}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
