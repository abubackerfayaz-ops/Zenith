'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  MoreHorizontal,
  Mail,
  MessageCircle,
  Sword,
  UserPlus,
  UserCheck,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Menu } from '@/components/ui/menu';
import type { User } from '@/types';

interface ProfileHeaderProps {
  user: User;
  isOwner?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onMessage?: () => void;
  onBattle?: () => void;
  onEditProfile?: () => void;
  className?: string;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * end);
      setDisplayValue(start);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span ref={ref}>
      {formatNumber(displayValue)}{suffix}
    </span>
  );
}

export function ProfileHeader({
  user,
  isOwner = false,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onMessage,
  onBattle,
  onEditProfile,
  className,
}: ProfileHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-4', className)}
    >
      {/* Cover Image */}
      <div className="relative h-40 sm:h-56 md:h-64 rounded-2xl overflow-hidden glass-card">
        {user.coverUrl && !imgError ? (
          <img
            src={user.coverUrl}
            alt={`${user.displayName}'s cover`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-900 via-primary-700 to-accent-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Action Buttons on Cover */}
        {isOwner && (
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="glass"
              size="sm"
              onClick={onEditProfile}
              leftIcon={<Settings size={14} />}
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 pb-4">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="absolute -top-14 left-4 z-10"
        >
          <Avatar
            src={user.avatarUrl}
            name={user.displayName}
            size="3xl"
            isVerified={user.isVerified}
            className="ring-4 ring-background"
          />
        </motion.div>

        {/* Name and Bio */}
        <div className="pt-12 sm:pt-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {user.displayName}
                </h1>
                {user.isVerified && (
                  <ShieldCheck size={20} className="text-primary-500 fill-primary-500/20" />
                )}
                {user.personality && (
                  <Badge variant="premium" icon={<ShieldCheck size={10} />}>
                    {user.personality}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {isOwner ? (
                <Button variant="outline" size="sm" onClick={onEditProfile}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  {isFollowing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onUnfollow}
                      leftIcon={<UserCheck size={14} />}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className={cn(isHovered && 'border-red-500 text-red-500 hover:bg-red-500/10')}
                    >
                      {isHovered ? 'Unfollow' : 'Following'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onFollow}
                      leftIcon={<UserPlus size={14} />}
                    >
                      Follow
                    </Button>
                  )}
                  <Button variant="glass" size="sm" onClick={onMessage} leftIcon={<MessageCircle size={14} />}>
                    Message
                  </Button>
                  <Button variant="secondary" size="sm" onClick={onBattle} leftIcon={<Sword size={14} />}>
                    Battle
                  </Button>
                </>
              )}
              <Menu
                align="end"
                trigger={
                  <button className="p-2 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                }
                items={[
                  { id: 'share', label: 'Share Profile', icon: <Mail size={16} /> },
                  { id: 'report', label: 'Report User', icon: <ShieldCheck size={16} />, danger: true },
                ]}
              />
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-sm text-foreground/80 max-w-lg whitespace-pre-line"
            >
              {user.bio}
            </motion.p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs sm:text-sm text-muted-foreground">
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-500 hover:underline"
              >
                <LinkIcon size={12} />
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Joined {formatDate(user.createdAt, 'MMMM yyyy')}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            {[
              { label: 'Posts', value: user.postsCount },
              { label: 'Followers', value: user.followersCount },
              { label: 'Following', value: user.followingCount },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -1 }}
                className="flex flex-col items-start"
              >
                <span className="text-lg font-bold text-foreground tabular-nums">
                  <AnimatedCounter value={stat.value} />
                </span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
