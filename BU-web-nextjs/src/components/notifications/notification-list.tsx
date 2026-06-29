'use client';

import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Swords,
  Trophy,
  Star,
  MoreHorizontal,
} from 'lucide-react';
import { cn, timeAgo, formatNumber } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'battle' | 'achievement' | 'milestone';

interface Notification {
  id: string;
  type: NotificationType;
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, string>;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onAction?: (notification: Notification) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

const typeConfig: Record<NotificationType, { icon: typeof Heart; color: string; bgColor: string }> = {
  like: { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  comment: { icon: MessageCircle, color: 'text-primary-500', bgColor: 'bg-primary-500/10' },
  follow: { icon: UserPlus, color: 'text-accent-500', bgColor: 'bg-accent-500/10' },
  mention: { icon: AtSign, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  battle: { icon: Swords, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  achievement: { icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  milestone: { icon: Star, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, height: 0, padding: 0, margin: 0, transition: { duration: 0.2 } },
};

export function NotificationList({
  notifications,
  onMarkRead,
  onAction,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
  emptyMessage = 'No notifications yet',
}: NotificationListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasMore || isLoading) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      onLoadMore?.();
    }
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className={cn(
        'flex flex-col h-full glass-card rounded-2xl border border-white/10 overflow-y-auto custom-scrollbar',
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="text-xs">
              {notifications.filter((n) => !n.isRead).length} new
            </Badge>
            <button className="p-1.5 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center p-6">
            <div className="p-3 rounded-full bg-glass-light text-muted-foreground mb-3">
              <Heart size={24} />
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  onClick={() => {
                    if (!notification.isRead) onMarkRead(notification.id);
                  }}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer relative',
                    notification.isRead
                      ? 'hover:bg-glass-light'
                      : 'bg-primary-500/5 hover:bg-primary-500/10',
                  )}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary-500" />
                  )}

                  {/* Icon Badge */}
                  <div
                    className={cn(
                      'shrink-0 size-9 rounded-full flex items-center justify-center',
                      config.bgColor,
                    )}
                  >
                    <Icon size={16} className={config.color} />
                  </div>

                  {/* Avatar */}
                  <div className="shrink-0">
                    <Avatar
                      src={notification.user.avatarUrl}
                      name={notification.user.name}
                      size="sm"
                      isVerified={notification.user.isVerified}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      <span className="font-semibold">{notification.user.name}</span>
                      {' '}{notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(notification.timestamp)}
                      </span>
                      {notification.actionLabel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2 text-primary-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.(notification);
                          }}
                        >
                          {notification.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Menu Button */}
                  <button className="shrink-0 p-1 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Loading More */}
        {isLoading && notifications.length > 0 && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}

        {/* End Marker */}
        {!hasMore && notifications.length > 0 && (
          <div className="text-center py-4">
            <span className="text-xs text-muted-foreground">All caught up!</span>
          </div>
        )}
      </div>
    </div>
  );
}
