'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Compass,
  Clapperboard,
  MessageCircle,
  Bell,
  PlusSquare,
  User,
  ChevronLeft,
  ChevronRight,
  Flame,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-media-query';
import { Tooltip } from '@/components/ui/tooltip';
import { Avatar } from '@/components/ui/avatar';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

interface SidebarProps {
  user?: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  unreadNotifications?: number;
  unreadMessages?: number;
  className?: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={24} />, href: ROUTES.HOME },
  { id: 'search', label: 'Search', icon: <Search size={24} />, href: ROUTES.SEARCH },
  { id: 'explore', label: 'Explore', icon: <Compass size={24} />, href: ROUTES.EXPLORE },
  { id: 'reels', label: 'Reels', icon: <Clapperboard size={24} />, href: '/reels' },
  { id: 'messages', label: 'Messages', icon: <MessageCircle size={24} />, href: ROUTES.MESSAGES },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={24} />, href: ROUTES.NOTIFICATIONS },
  { id: 'create', label: 'Create', icon: <PlusSquare size={24} />, href: '#' },
  { id: 'profile', label: 'Profile', icon: <User size={24} />, href: '/profile' },
];

export function Sidebar({
  user,
  unreadNotifications = 0,
  unreadMessages = 0,
  className,
}: SidebarProps) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 glass rounded-xl text-foreground"
        >
          <Menu size={22} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 z-50 h-full w-72 glass-heavy shadow-2xl border-r border-white/10"
              >
                <SidebarContent
                  user={user}
                  activeItem={activeItem}
                  setActiveItem={setActiveItem}
                  setMobileOpen={setMobileOpen}
                  unreadNotifications={unreadNotifications}
                  unreadMessages={unreadMessages}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'h-screen sticky top-0 glass-heavy border-r border-white/10 hidden lg:flex flex-col py-4 overflow-hidden',
        className,
      )}
    >
      <div className={cn('flex items-center px-4 mb-6', collapsed && 'justify-center')}>
        {collapsed ? (
          <Flame size={28} className="text-primary-500" />
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <Flame size={28} className="text-primary-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              FameWars
            </span>
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;

          return (
            <Tooltip
              key={item.id}
              content={item.label}
              position="right"
              delay={500}
            >
              <button
                onClick={() => {
                  setActiveItem(item.id);
                  if (item.href !== '#') {
                    // navigation handled by router
                  }
                }}
                className={cn(
                  'relative flex items-center gap-4 w-full rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'text-primary-500 bg-primary-500/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-glass-light',
                )}
              >
                <span className="shrink-0">{Icon}</span>
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.id === 'notifications' && unreadNotifications > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                    {item.id === 'messages' && unreadMessages > 0 && (
                      <span className="ml-auto bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </>
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                  />
                )}
              </button>
            </Tooltip>
          );
        })}
      </nav>

      <div className="px-2 mt-auto">
        {user && (
          <Tooltip content={user.displayName} position="right" delay={500}>
            <button
              onClick={() => setActiveItem('profile')}
              className={cn(
                'flex items-center gap-3 w-full rounded-xl p-3 transition-colors hover:bg-glass-light',
                collapsed && 'justify-center',
              )}
            >
              <Avatar
                src={user.avatarUrl}
                name={user.displayName}
                size="sm"
              />
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user.username}
                  </p>
                </div>
              )}
            </button>
          </Tooltip>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full mt-2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}

function SidebarContent({
  user,
  activeItem,
  setActiveItem,
  setMobileOpen,
  unreadNotifications,
  unreadMessages,
}: {
  user?: SidebarProps['user'];
  activeItem: string;
  setActiveItem: (id: string) => void;
  setMobileOpen: (open: boolean) => void;
  unreadNotifications: number;
  unreadMessages: number;
}) {
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <Flame size={28} className="text-primary-500" />
        <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          FameWars
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                'relative flex items-center gap-4 w-full rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary-500 bg-primary-500/10'
                  : 'text-foreground/70 hover:text-foreground hover:bg-glass-light',
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'notifications' && unreadNotifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
              {item.id === 'messages' && unreadMessages > 0 && (
                <span className="ml-auto bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-mobile"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {user && (
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <Avatar
              src={user.avatarUrl}
              name={user.displayName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{user.username}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
