import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Camera, Send, Smile } from 'lucide-react';
import api from '../lib/api';

export default function MessagesView() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [input, setInput] = useState('');

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

  const currentChat = chats[active];
  const otherUser = currentChat?.participants?.find((p: any) => p.id !== currentChat.userId) || currentChat?.participants?.[0];

  return (
    <div className="h-full flex overflow-hidden font-body">
      {/* Conversation list */}
      <div className="w-64 lg:w-72 flex-shrink-0 flex flex-col border-r border-white/[.05] glass">
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
            chats.map((c: any, i: number) => {
              const u = c.participants?.find((p: any) => p.id !== c.userId) || c.participants?.[0];
              const ini = (u?.displayName || u?.username || '?').slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={c.id}
                  onClick={() => setActive(i)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 lg:p-4 cursor-pointer transition-colors border-b border-white/[.03] ${
                    active === i ? 'bg-white/[.07]' : 'hover:bg-white/[.04]'
                  }`}
                >
                  {u?.profilePicture ? (
                    <img src={u.profilePicture} className="w-[38px] h-[38px] rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple-500 flex-shrink-0">{ini}</div>
                  )}
                  <div className="flex-1 min-w-0 hidden lg:block">
                    <span className="text-white text-sm font-semibold truncate">{u?.displayName || u?.username}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[.05] glass flex-shrink-0">
          {otherUser?.profilePicture ? (
            <img src={otherUser.profilePicture} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple-500">
              {(otherUser?.displayName || otherUser?.username || '?').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-white font-semibold text-sm">{otherUser?.displayName || otherUser?.username || 'Chat'}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hidden p-5 flex flex-col gap-3">
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-sm">Select a chat to start messaging</p>
          </div>
        </div>

        <div className="p-4 border-t border-white/[.05] glass flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/[.07] border border-white/[.07]">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Send a message…"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
              />
              <button><Smile size={17} className="text-white/35 hover:text-white/60 transition-colors" /></button>
            </div>
            <button
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${input ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-white/[.07]'}`}
            >
              <Send size={15} className={input ? 'text-white' : 'text-white/50'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
