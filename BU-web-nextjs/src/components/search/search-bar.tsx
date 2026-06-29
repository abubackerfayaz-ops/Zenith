'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Users, Hash, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'user' | 'hashtag' | 'post';
  label: string;
  description?: string;
  image?: string;
  url: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => {
      setResults([
        { id: '1', type: 'user', label: 'creativestar', description: 'Creative Star', image: 'https://api.dicebear.com/8.x/avataaars/svg?seed=creator', url: '/profile/creativestar' },
        { id: '2', type: 'hashtag', label: '#viral', description: '42 posts', url: '/hashtag/viral' },
        { id: '3', type: 'hashtag', label: '#trending', description: '56 posts', url: '/hashtag/trending' },
      ]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search users, hashtags..."
          className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-10 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-white/40 hover:text-white" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query.length >= 2 || !query) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            {!query ? (
              <div className="p-4">
                <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </div>
                {['#trending', '#viral', '#creator', '#photography'].map((tag) => (
                  <a key={tag} href={`/hashtag/${tag.replace('#', '')}`} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-white/80 hover:text-white">
                    <Hash className="w-4 h-4 text-primary-400" />
                    <span className="text-sm">{tag}</span>
                  </a>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((r) => (
                  <a key={r.id} href={r.url} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors">
                    {r.type === 'user' ? (
                      <Avatar src={r.image} alt={r.label} size="sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <Hash className="w-4 h-4 text-primary-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.label}</p>
                      {r.description && <p className="text-xs text-white/50 truncate">{r.description}</p>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-white/40 text-sm">No results for &ldquo;{query}&rdquo;</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
