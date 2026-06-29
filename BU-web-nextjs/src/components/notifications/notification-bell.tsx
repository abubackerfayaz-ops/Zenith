'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Heart, MessageCircle, UserPlus, AtSign, Swords, Trophy, Star, CheckCheck } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'battle' | 'achievement' | 'milestone';

interface QuickNotification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationBellProps {
  unreadCount: number;
  notifications: QuickNotification[];
  onBellClick?: () => void;
  onNotificationClick?: (id: string) => void;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
  className?: string;
}

const typeIcons: Record<NotificationType, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  battle: Swords,
  achievement: Trophy,
  milestone: Star,
};

const typeColors: Record<NotificationType, string> = {
  like: 'text-red-500',
  comment: 'text-primary-500',
  follow: 'text-accent-500',
  mention: 'text-amber-500',
  battle: 'text-orange-500',
  achievement: 'text-yellow-500',
  milestone: 'text-emerald-500',
};

export function NotificationBell({
  unreadCount,
  notifications,
  onBellClick,
  onNotificationClick,
  onMarkAllRead,
  onViewAll,
  className,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) onBellClick?.();
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {unreadCount > 0 ? (
          <BellRing size={20} className="text-primary-500" />
        ) : (
          <Bell size={20} />
        )}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-background"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[360px] sm:w-[400px] glass-heavy rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllRead?.();
                    }}
                    className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400 transition-colors px-2 py-1 rounded-lg hover:bg-primary-500/10"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
              {recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <Bell size={24} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    Activity from your fans will show up here
                  </p>
                </div>
              ) : (
                <div>
                  {recentNotifications.map((n, i) => {
                    const Icon = typeIcons[n.type];
                    const colorClass = typeColors[n.type];

                    return (
                      <motion.button
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => {
                          onNotificationClick?.(n.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                          n.isRead ? 'hover:bg-glass-light' : 'bg-primary-500/5',
                        )}
                      >
                        <div className={cn('shrink-0 size-8 rounded-full flex items-center justify-center bg-glass-light', colorClass)}>
                          <Icon size={14} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <Avatar
                              src={n.user.avatarUrl}
                              name={n.user.name}
                              size="xs"
                              isVerified={n.user.isVerified}
                            />
                            <p className="text-sm text-foreground leading-snug">
                              <span className="font-semibold">{n.user.name}</span>{' '}
                              {n.message}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">
                            {timeAgo(n.timestamp)}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10">
              <Button
                variant="ghost"
                fullWidth
                size="sm"
                onClick={() => {
                  onViewAll?.();
                  setIsOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
