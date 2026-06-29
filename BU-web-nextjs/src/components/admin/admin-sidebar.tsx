'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Flag,
  FileText,
  BarChart3,
  DollarSign,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: Flag, badge: 12 },
  { label: 'Content', href: '/admin/content', icon: FileText, badge: 5 },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Ads', href: '/admin/ads', icon: DollarSign },
  { label: 'Revenue', href: '/admin/revenue', icon: TrendingUp },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative glass border-r border-white/10 h-screen flex flex-col transition-all duration-300 shrink-0',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500/20 text-primary-400">
          <Shield className="w-5 h-5" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-semibold text-foreground truncate"
            >
              Admin Panel
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-glass-light',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                  />
                )}
                <item.icon className="w-5 h-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && !collapsed && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto bg-rose-500/15 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
