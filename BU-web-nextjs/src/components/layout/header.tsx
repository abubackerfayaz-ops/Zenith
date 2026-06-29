'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flame,
  PlusSquare,
  Bell,
  MessageCircle,
  Search,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-media-query';
import { useDebounce } from '@/hooks/use-debounce';
import { Avatar } from '@/components/ui/avatar';
import { Menu } from '@/components/ui/menu';

interface HeaderProps {
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
  } | null;
  unreadNotifications?: number;
  unreadMessages?: number;
  onSearch?: (query: string) => void;
  onCreatePress?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function Header({
  user,
  unreadNotifications = 0,
  unreadMessages = 0,
  onSearch,
  onCreatePress,
  onLogout,
  className,
}: HeaderProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(debouncedSearch);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'sticky top-0 z-30 glass-heavy border-b border-white/10',
        className,
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Flame size={26} className="text-primary-500" />
            <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              FameWars
            </span>
          </Link>
        </div>

        {!isMobile && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div
              className={cn(
                'relative w-full transition-all duration-200',
                isSearchFocused && 'scale-105',
              )}
            >
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search FameWars..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="glass-input w-full pl-9 pr-4 py-2 text-sm rounded-full"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onCreatePress}
            className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-glass-light transition-colors"
          >
            <PlusSquare size={22} />
          </button>

          <Link
            href={ROUTES.NOTIFICATIONS}
            className="relative p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-glass-light transition-colors"
          >
            <Bell size={22} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Link>

          <Link
            href={ROUTES.MESSAGES}
            className="relative p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-glass-light transition-colors"
          >
            <MessageCircle size={22} />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>

          {user ? (
            <Menu
              align="end"
              trigger={
                <button className="flex items-center gap-1 p-1 rounded-full hover:bg-glass-light transition-colors">
                  <Avatar
                    src={user.avatarUrl}
                    name={user.displayName}
                    size="sm"
                    isVerified={user.isVerified}
                  />
                  <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
                </button>
              }
              sections={[
                {
                  items: [
                    {
                      id: 'profile',
                      label: 'Profile',
                      icon: <User size={16} />,
                      onClick: () => {},
                    },
                    {
                      id: 'settings',
                      label: 'Settings',
                      icon: <Settings size={16} />,
                      onClick: () => {},
                    },
                  ],
                },
                {
                  items: [
                    {
                      id: 'logout',
                      label: 'Log Out',
                      icon: <LogOut size={16} />,
                      danger: true,
                      onClick: onLogout,
                    },
                  ],
                },
              ]}
            />
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="text-sm font-semibold text-primary-500 hover:text-primary-400 transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
