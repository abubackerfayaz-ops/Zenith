'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserCheck, UserPlus } from 'lucide-react';
import { cn, formatNumber, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Modal } from '@/components/ui/modal';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import type { User } from '@/types';

interface FollowerListProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  users: User[];
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

function FollowerItem({
  user,
  onFollow,
  onUnfollow,
}: {
  user: User;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          src={user.avatarUrl}
          name={user.displayName}
          size="md"
          isVerified={user.isVerified}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {user.displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            @{user.username}
          </p>
          {user.bio && (
            <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {user.isVerified && !isFollowing && (
        <Button
          variant={isFollowing ? 'outline' : 'primary'}
          size="sm"
          onClick={() => {
            if (isFollowing) {
              onUnfollow?.(user.id);
            } else {
              onFollow?.(user.id);
            }
            setIsFollowing(!isFollowing);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          leftIcon={
            isFollowing ? (
              <UserCheck size={12} />
            ) : (
              <UserPlus size={12} />
            )
          }
          className={cn(
            'shrink-0',
            isHovered && isFollowing && 'border-red-500 text-red-500 hover:bg-red-500/10',
          )}
        >
          {isHovered && isFollowing ? 'Unfollow' : isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </motion.div>
  );
}

function FollowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="size-10 rounded-full bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-2.5 w-16 rounded bg-white/10" />
      </div>
      <div className="h-8 w-20 rounded-lg bg-white/10" />
    </div>
  );
}

export function FollowerList({
  isOpen,
  onClose,
  type,
  users,
  onFollow,
  onUnfollow,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: FollowerListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: onLoadMore ?? (() => {}),
    hasMore,
    isLoading,
  });

  const filteredUsers = searchQuery
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'followers' ? 'Followers' : 'Following'}
      size="sm"
      className="p-0"
    >
      <div className={cn('flex flex-col h-[500px]', className)}>
        {/* Search */}
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-9 pr-9 py-2 text-sm rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading && users.length === 0 ? (
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <FollowSkeleton key={i} />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="p-3 rounded-full bg-white/5 mb-3">
                <UserPlus size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {searchQuery ? 'No results found' : `No ${type} yet`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? 'Try a different search term'
                  : `When someone ${type === 'followers' ? 'follows' : 'you follow'} them, they'll appear here`}
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <FollowerItem
                    key={user.id}
                    user={user}
                    onFollow={onFollow}
                    onUnfollow={onUnfollow}
                  />
                ))}
              </AnimatePresence>

              {/* Infinite Scroll Sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {isLoading && (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
