'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Video,
  MoreHorizontal,
  Smile,
  Paperclip,
  Image,
  Music,
  FileText,
  Send,
  ChevronLeft,
} from 'lucide-react';
import { cn, timeAgo, formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Menu } from '@/components/ui/menu';
import type { Message } from '@/types';

interface ChatWindowUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  lastSeen?: string;
}

interface ChatWindowProps {
  user: ChatWindowUser;
  messages: Message[];
  currentUserId: string;
  onBack?: () => void;
  onSendMessage: (text: string, replyTo?: string) => void;
  onAttachment: (type: 'image' | 'voice' | 'file') => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  className?: string;
}

const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export function ChatWindow({
  user,
  messages,
  currentUserId,
  onBack,
  onSendMessage,
  onAttachment,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  className,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasMore || isLoadingMore) return;
    if (el.scrollTop < 100) {
      onLoadMore?.();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    onSendMessage(text, replyTo?.id);
    setInputValue('');
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>((acc, msg) => {
    const date = formatDate(msg.createdAt, 'yyyy-MM-dd');
    const last = acc[acc.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      acc.push({ date, messages: [msg] });
    }
    return acc;
  }, []);

  const attachOptions = [
    { id: 'image', label: 'Image', icon: <Image size={16} />, onClick: () => onAttachment('image') },
    { id: 'voice', label: 'Voice', icon: <Music size={16} />, onClick: () => onAttachment('voice') },
    { id: 'file', label: 'File', icon: <FileText size={16} />, onClick: () => onAttachment('file') },
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-full glass-card rounded-2xl border border-white/10 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded-full hover:bg-glass-light text-muted-foreground transition-colors lg:hidden"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size="md"
            showOnlineIndicator
            isOnline={user.isOnline}
            isVerified={user.isVerified}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">{user.name}</span>
              {user.isVerified && (
                <Badge variant="primary" className="text-[8px] px-1 py-0">✓</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {user.isOnline
                ? 'Online now'
                : user.lastSeen
                  ? `Last seen ${timeAgo(user.lastSeen)}`
                  : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone size={16} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
          >
            <Video size={16} />
          </motion.button>
          <Menu
            trigger={
              <button className="p-2 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal size={16} />
              </button>
            }
            items={[
              { id: 'view-profile', label: 'View Profile', onClick: () => {} },
              { id: 'search', label: 'Search in Chat', onClick: () => {} },
              { id: 'clear', label: 'Clear Chat', danger: true, onClick: () => {} },
            ]}
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="size-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center mb-3">
              <span className="text-[10px] text-muted-foreground bg-glass-light px-2.5 py-1 rounded-full">
                {formatDate(group.date, 'MMM d, yyyy')}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {group.messages.map((msg, idx) => {
                const isSent = msg.senderId === currentUserId;
                const showAvatar =
                  !isSent &&
                  (idx === group.messages.length - 1 ||
                    group.messages[idx + 1]?.senderId !== msg.senderId);

                return (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex items-end gap-2 mb-1',
                      isSent ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {!isSent && (
                      <div className={cn('shrink-0', showAvatar ? 'visible' : 'invisible')}>
                        <Avatar
                          src={user.avatarUrl}
                          name={user.name}
                          size="xs"
                        />
                      </div>
                    )}

                    <div className={cn('flex flex-col max-w-[75%]', isSent ? 'items-end' : 'items-start')}>
                      {msg.replyTo && (
                        <div
                          className={cn(
                            'text-xs p-2 rounded-lg mb-1 border-l-2 max-w-full truncate',
                            isSent
                              ? 'bg-primary-500/20 border-primary-500 text-right'
                              : 'bg-glass-light border-muted-foreground text-left',
                          )}
                        >
                          {msg.replyTo.text}
                        </div>
                      )}

                      <div
                        className={cn(
                          'relative px-3 py-2 text-sm leading-relaxed break-words',
                          isSent
                            ? 'bg-primary-500 text-white rounded-2xl rounded-br-md'
                            : 'bg-glass-light text-foreground rounded-2xl rounded-bl-md',
                        )}
                      >
                        {msg.text}
                      </div>

                      <div className={cn('flex items-center gap-1 mt-0.5 px-1')}>
                        {msg.isEdited && (
                          <span className="text-[9px] text-muted-foreground">edited</span>
                        )}
                        <span className="text-[9px] text-muted-foreground">
                          {timeAgo(msg.createdAt)}
                        </span>
                        {isSent && msg.readAt && (
                          <span className="text-[9px] text-primary-500">✓✓</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2"
            >
              <Avatar src={user.avatarUrl} name={user.name} size="xs" />
              <div className="bg-glass-light rounded-2xl px-4 py-2.5 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-2 px-4 py-2 bg-glass-light border-t border-white/10"
          >
            <div className="flex-1 min-w-0">
              <span className="text-xs text-primary-500 font-medium">Replying</span>
              <p className="text-xs text-muted-foreground truncate">{replyTo.text}</p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-background/50 backdrop-blur-xl">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full glass-input rounded-2xl pl-4 pr-20 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
            />

            <div className="absolute right-1 bottom-1 flex items-center gap-0.5">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
              >
                <Smile size={16} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-1.5 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Paperclip size={16} />
                </button>

                <AnimatePresence>
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      className="absolute bottom-full right-0 mb-2 glass-heavy rounded-xl p-2 shadow-xl border border-white/10 min-w-[140px]"
                    >
                      {attachOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            opt.onClick();
                            setShowAttachMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-glass-light rounded-lg transition-colors"
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              'p-3 rounded-full transition-colors shrink-0',
              inputValue.trim()
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25'
                : 'bg-glass-light text-muted-foreground cursor-not-allowed',
            )}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
