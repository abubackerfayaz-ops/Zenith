'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Plus, CheckCheck, Pin } from 'lucide-react';
import { cn, timeAgo, formatNumber } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  lastMessage?: {
    text: string;
    timestamp: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount?: number;
  isPinned?: boolean;
  isGroup?: boolean;
  members?: ChatUser[];
}

interface ChatListProps {
  chats: ChatUser[];
  activeChatId?: string;
  onChatSelect: (chatId: string) => void;
  onSearch?: (query: string) => void;
  onCreateGroup?: () => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function ChatList({
  chats,
  activeChatId,
  onChatSelect,
  onSearch,
  onCreateGroup,
  className,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredChats = useMemo(() => {
    let result = [...chats];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (chat) =>
          chat.name.toLowerCase().includes(q) ||
          chat.username.toLowerCase().includes(q) ||
          chat.lastMessage?.text.toLowerCase().includes(q),
      );
    }
    if (showOnlineOnly) {
      result = result.filter((chat) => chat.isOnline);
    }
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.lastMessage?.timestamp || '';
      const bTime = b.lastMessage?.timestamp || '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [chats, searchQuery, showOnlineOnly]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full glass-card rounded-2xl border border-white/10 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Messages</h2>
          <button
            onClick={onCreateGroup}
            className="p-2 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            className={cn(
              'text-xs px-3 py-1 rounded-full transition-colors',
              showOnlineOnly
                ? 'bg-primary-500/20 text-primary-500'
                : 'text-muted-foreground hover:text-foreground bg-glass-light',
            )}
          >
            Online
          </button>
          <button className="text-xs px-3 py-1 rounded-full bg-glass-light text-muted-foreground hover:text-foreground transition-colors">
            Unread
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-sm text-muted-foreground">No conversations found</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="py-1"
          >
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onClick={() => onChatSelect(chat.id)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="p-3 border-t border-white/10 text-center">
        <p className="text-[10px] text-muted-foreground">
          {chats.length} conversations
        </p>
      </div>
    </div>
  );
}

function ChatListItem({
  chat,
  isActive,
  onClick,
}: {
  chat: ChatUser;
  isActive: boolean;
  onClick: () => void;
}) {
  const lastText = chat.lastMessage?.text || 'No messages yet';
  const truncated = lastText.length > 40 ? lastText.slice(0, 40) + '...' : lastText;

  return (
    <motion.button
      variants={itemVariants}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 transition-colors text-left relative',
        isActive
          ? 'bg-primary-500/10 border-l-2 border-primary-500'
          : 'hover:bg-glass-light border-l-2 border-transparent',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar
          src={chat.isGroup ? undefined : chat.avatarUrl}
          name={chat.isGroup ? chat.name : chat.name}
          size="md"
          showOnlineIndicator={!chat.isGroup}
          isOnline={chat.isOnline}
          isVerified={chat.isVerified}
        />
        {chat.isGroup && (
          <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-primary-500 border-2 border-background flex items-center justify-center">
            <span className="text-[6px] font-bold text-white">G</span>
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {chat.isPinned && (
              <Pin size={10} className="text-muted-foreground shrink-0" />
            )}
            <span className="text-sm font-semibold text-foreground truncate">
              {chat.name}
            </span>
          </div>
          {chat.lastMessage?.timestamp && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {timeAgo(chat.lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 min-w-0">
            {chat.lastMessage?.isRead && (
              <CheckCheck size={10} className="text-primary-500 shrink-0" />
            )}
            <span className="text-xs text-muted-foreground truncate">
              {truncated}
            </span>
          </div>
          {chat.unreadCount && chat.unreadCount > 0 ? (
            <Badge variant="primary" className="text-[10px] px-1.5 py-0 min-w-[18px] text-center shrink-0">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </Badge>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}
