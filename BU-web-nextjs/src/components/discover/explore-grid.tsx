'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, Play, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'all', label: 'All', icon: Grid },
  { id: 'photos', label: 'Photos' },
  { id: 'videos', label: 'Videos', icon: Play },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

const MOCK_POSTS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  type: i % 3 === 0 ? 'video' : 'photo',
  likes: Math.floor(Math.random() * 5000),
  comments: Math.floor(Math.random() * 200),
  url: `https://picsum.photos/seed/${i + 50}/400/400`,
}));

export function ExploreGrid() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div>
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-white/50 hover:text-white/80'
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-3 gap-1 md:gap-2">
        {MOCK_POSTS.filter((p) => activeTab === 'all' || activeTab === p.type + 's').map((post, i) => (
          <motion.a
            key={post.id}
            href={`/post/${post.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className="relative aspect-square group overflow-hidden rounded-md bg-white/5 cursor-pointer"
          >
            <img src={post.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <span className="text-white text-sm font-medium flex items-center gap-1">
                ❤️ {post.likes}
              </span>
              <span className="text-white text-sm font-medium flex items-center gap-1">
                💬 {post.comments}
              </span>
            </div>
            {post.type === 'video' && (
              <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                <Play className="w-3.5 h-3.5 text-white" fill="white" />
              </div>
            )}
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
