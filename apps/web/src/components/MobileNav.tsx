import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NAV } from '../lib/constants';
import api from '../lib/api';
import type { View } from '../lib/types';

interface MobileNavProps {
  current: View;
  onChange: (v: View) => void;
}

const MAIN_NAV = NAV.filter(n => n.id !== 'landing' && n.id !== 'cards');

export default function MobileNav({ current, onChange }: MobileNavProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data?.count ?? 0);
      } catch {}
    }
    fetchUnread();
  }, []);

  const navItems = MAIN_NAV.map(n => ({
    ...n,
    badge: n.id === 'notifications' ? (unreadCount > 0 ? unreadCount : undefined) : n.badge,
  }));
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 glass-strong border-t border-white/[.06]">
      {navItems.map(({ id, icon: Icon, label, badge }) => {
        const active = current === id;
        return (
          <motion.button
            key={id}
            onClick={() => onChange(id)}
            whileTap={{ scale: 0.85 }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition-colors relative min-w-[52px] ${
              active ? 'text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {badge != null && (
                <span className="absolute -top-1.5 -right-2.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-pink-500">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">{label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
