'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  PlusSquare,
  Clapperboard,
  User,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  onClick?: () => void;
}

interface MobileNavProps {
  onCreatePress?: () => void;
  className?: string;
}

export function MobileNav({ onCreatePress, className }: MobileNavProps) {
  const [activeTab, setActiveTab] = useState('home');

  const tabs: MobileNavTab[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={24} />,
      activeIcon: <Home size={24} />,
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search size={24} />,
    },
    {
      id: 'create',
      label: 'Create',
      icon: <PlusSquare size={24} />,
      onClick: onCreatePress,
    },
    {
      id: 'reels',
      label: 'Reels',
      icon: <Clapperboard size={24} />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={24} />,
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'glass-heavy border-t border-white/10',
        'safe-area-inset-bottom',
        className,
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isCreate = tab.id === 'create';

          if (isCreate) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  tab.onClick?.();
                  setActiveTab(tab.id);
                }}
                className="relative flex flex-col items-center justify-center"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-xl shadow-lg shadow-primary-500/30 -mt-4"
                >
                  <PlusSquare size={22} className="text-white" />
                </motion.div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 py-1 px-4 min-w-[60px]',
              )}
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-primary-500' : 'text-muted-foreground',
                )}
              >
                {tab.icon}
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary-500' : 'text-muted-foreground',
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
