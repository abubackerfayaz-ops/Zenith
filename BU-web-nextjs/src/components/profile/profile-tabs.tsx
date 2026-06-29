'use client';

import { motion } from 'framer-motion';
import {
  Grid3X3,
  Film,
  Bookmark,
  UserSquare2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileTabId = 'posts' | 'reels' | 'saved' | 'tagged' | 'highlights';

interface ProfileTab {
  id: ProfileTabId;
  label: string;
  icon: typeof Grid3X3;
  count?: number;
}

const TABS: ProfileTab[] = [
  { id: 'posts', label: 'Posts', icon: Grid3X3 },
  { id: 'reels', label: 'Reels', icon: Film },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'tagged', label: 'Tagged', icon: UserSquare2 },
  { id: 'highlights', label: 'Highlights', icon: Sparkles },
];

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  counts?: Partial<Record<ProfileTabId, number>>;
  className?: string;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  counts,
  className,
}: ProfileTabsProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Tab Bar */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = counts?.[tab.id];

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/70',
              )}
              whileTap={{ scale: 0.97 }}
            >
              <Icon size={16} className="hidden sm:block" />
              <span className="hidden sm:inline">{tab.label}</span>
              {count !== undefined && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {count}
                </span>
              )}

              {/* Animated Underline */}
              {isActive && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
