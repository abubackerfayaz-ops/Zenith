import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Heart, MessageCircle, UserPlus, Zap, AtSign } from 'lucide-react';
import api from '../lib/api';
import { formatNumber } from '../lib/utils';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  actor?: {
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  data?: any;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FOLLOW: UserPlus,
  BATTLE: Zap,
  MENTION: AtSign,
  BATTLE_VOTE: Zap,
  BATTLE_WIN: Zap,
  BATTLE_LOST: Zap,
};

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/notifications?page=1&limit=50');
        const data = res.data?.data || res.data || [];
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  }

  async function deleteNotification(id: string) {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  }

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden px-5 py-5 font-body">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Bell size={22} className="text-purple-400" />
          <h1 className="text-white text-xl font-black font-display">Notifications</h1>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-pink-500">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/[.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 rounded bg-white/[.06]" />
                <div className="h-2.5 w-24 rounded bg-white/[.04]" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Bell size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-lg font-semibold">No notifications</p>
          <p className="text-white/30 text-sm mt-1">Activity will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n, i) => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`glass rounded-2xl p-4 flex items-start gap-3 transition-colors ${n.isRead ? '' : 'border-l-2 border-purple-500 bg-purple-500/[.04]'}`}
              >
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-purple-500/20 overflow-hidden">
                  {n.actor?.profilePicture ? (
                    <img src={n.actor.profilePicture} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={16} className="text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-semibold">{n.actor?.displayName || n.actor?.username || 'System'}</span>{' '}
                    {n.body || n.title}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="text-white/15 hover:text-white/50 transition-colors flex-shrink-0 mt-1"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
