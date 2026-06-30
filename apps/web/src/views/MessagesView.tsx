import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useMessaging } from '../lib/socket';
import api from '../lib/api';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  readAt: string | null;
}

interface Chat {
  id: string;
  participants: { id: string; username: string; displayName: string; profilePicture?: string }[];
  messages?: Message[];
}

export default function MessagesView() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { joinChat, onNewMessage } = useMessaging();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/chats');
        setChats(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load chats:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const unsub = onNewMessage((msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => unsub();
  }, [onNewMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function selectChat(chatId: string) {
    setActiveChatId(chatId);
    setShowMobileList(false);
    setMessagesLoading(true);
    joinChat(chatId);
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !activeChatId || sending) return;
    setSending(true);
    try {
      await api.post(`/chats/${activeChatId}/messages`, { content: text });
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const activeChat = chats.find(c => c.id === activeChatId);
  const otherUser = activeChat?.participants?.find((p: any) => p.id !== user?.id) || activeChat?.participants?.[0];

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="h-full flex overflow-hidden font-body">
      {/* Conversation list */}
      <div className={`w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col border-r border-white/[.05] glass ${showMobileList ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-white/[.05]">
          <h2 className="text-white font-bold text-base mb-3">Messages</h2>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[.05]">
            <Search size={13} className="text-white/35" />
            <input placeholder="Search…" className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          {loading ? (
            <div className="p-4 text-center text-white/30 text-sm">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-white/30 text-sm">No conversations yet</div>
          ) : (
            chats.map((c, i) => {
              const u = c.participants?.find((p: any) => p.id !== user?.id) || c.participants?.[0];
              const ini = (u?.displayName || u?.username || '?').slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={c.id}
                  onClick={() => selectChat(c.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 lg:p-4 cursor-pointer transition-colors border-b border-white/[.03] ${activeChatId === c.id ? 'bg-white/[.07]' : 'hover:bg-white/[.04]'}`}
                >
                  {u?.profilePicture ? (
                    <img src={u.profilePicture} className="w-[38px] h-[38px] rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple-500 flex-shrink-0">{ini}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm font-semibold truncate block">{u?.displayName || u?.username}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 flex flex-col overflow-hidden ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
        {activeChat && otherUser ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[.05] glass flex-shrink-0">
              <button onClick={() => { setShowMobileList(true); setActiveChatId(null); }} className="md:hidden text-white/50 hover:text-white mr-1">
                <ArrowLeft size={18} />
              </button>
              {otherUser?.profilePicture ? (
                <img src={otherUser.profilePicture} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple-500">
                  {(otherUser?.displayName || otherUser?.username || '?').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-white font-semibold text-sm">{otherUser?.displayName || otherUser?.username}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 flex flex-col gap-2">
              {messagesLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/30 text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-md'
                            : 'bg-white/[.08] text-white/90 rounded-bl-md'
                        }`}>
                          <span>{msg.content}</span>
                          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] text-white/40">{formatTime(msg.createdAt)}</span>
                            {isMine && (
                              msg.readAt ? <CheckCheck size={12} className="text-cyan-400" /> : <Check size={12} className="text-white/40" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/[.05] glass flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/[.07] border border-white/[.07]">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message…"
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${input.trim() ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-white/[.07]'}`}
                >
                  <Send size={15} className={input.trim() ? 'text-white' : 'text-white/50'} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[.05] flex items-center justify-center mx-auto mb-3">
                <Send size={22} className="text-white/25" />
              </div>
              <p className="text-white/40 text-sm font-medium">Select a conversation</p>
              <p className="text-white/20 text-xs mt-1">Choose a chat from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
