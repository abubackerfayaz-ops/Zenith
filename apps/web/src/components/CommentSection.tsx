import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Trash2 } from 'lucide-react';
import api from '../lib/api';
import type { Comment } from '../lib/types';

interface CommentSectionProps {
  postId: string;
  count: number;
  onCountChange?: (delta: number) => void;
}

export default function CommentSection({ postId, count, onCountChange }: CommentSectionProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/comments/post/${postId}?page=1&limit=20`);
        const data = res.data?.data || res.data || [];
        setComments(Array.isArray(data) ? data : []);
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [open, postId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post('/comments', { text: text.trim(), postId });
      const newComment = res.data?.data || res.data;
      setComments(prev => [newComment, ...prev]);
      setText('');
      onCountChange?.(1);
    } catch {} finally {
      setSending(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm transition-all"
      >
        <motion.div whileTap={{ scale: 1.3 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={open ? 'text-purple-400' : 'text-white/45'}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>
        <span className="text-white/50 text-xs">{count}</span>
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-white/[.06] mt-2"
        >
          <div className="max-h-52 overflow-y-auto scrollbar-hidden px-4 pt-2 space-y-2">
            {loading ? (
              <div className="flex justify-center py-3">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-3">No comments yet</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex gap-2 group">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white bg-purple-500/50 overflow-hidden">
                    {c.user.profilePicture ? (
                      <img src={c.user.profilePicture} className="w-full h-full object-cover" />
                    ) : (
                      (c.user.displayName || c.user.username).slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-xs font-semibold">{c.user.displayName || c.user.username}</span>{' '}
                    <span className="text-white/60 text-xs">{c.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-2.5 border-t border-white/[.06]">
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-white/[.06] rounded-lg px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/30"
              maxLength={2200}
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="text-purple-400 disabled:text-white/20 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
