import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth-context';
import { NAV } from '../lib/constants';
import Avatar from './Avatar';
import type { View } from '../lib/types';
import { cn } from '../lib/utils';

interface SidebarProps {
  current: View;
  onChange: (v: View) => void;
}

export default function Sidebar({ current, onChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const initials = user?.displayName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    || user?.username?.slice(0, 2).toUpperCase()
    || 'Z';

  return (
    <aside className="hidden md:flex flex-col w-[216px] min-h-screen py-6 px-3 glass border-r border-white/[0.06] relative z-20 flex-shrink-0 font-body">
      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 mb-9 px-3 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChange('landing')}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg text-white neon-purple bg-gradient-to-br from-purple-500 to-pink-500 font-display">
          Z
        </div>
        <span className="font-bold text-xl font-display">
          <span className="text-gradient">Zenith</span>
        </span>
      </motion.div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {NAV.map(({ id, icon: Icon, label, badge }) => {
          const active = current === id;
          return (
            <motion.button
              key={id}
              onClick={() => onChange(id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group text-left w-full',
                active
                  ? 'text-white bg-purple-500/[.18] border-l-2 border-purple-400'
                  : 'text-white/45 hover:text-white/75 hover:bg-white/[.04] border-l-2 border-transparent'
              )}
            >
              <Icon size={17} className={active ? 'text-purple-300' : ''} />
              {label}
              {badge != null && (
                <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-pink-500">
                  {badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User tile */}
      <motion.button
        onClick={() => onChange('profile')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass cursor-pointer hover:bg-white/[.08] transition-colors w-full text-left"
      >
        <Avatar ini={initials} color="#8B5CF6" size={32} />
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-semibold truncate">{user?.displayName || user?.username}</div>
          <div className="text-[11px] text-white/40 flex items-center gap-1">
            {user?.isVerified && <CheckCircle size={9} className="text-cyan-400" />}
            {user?.role}
          </div>
        </div>
      </motion.button>
      <button onClick={logout} className="text-[11px] text-white/30 hover:text-white/60 text-center mt-1 transition-colors">
        Sign out
      </button>
    </aside>
  );
}
