import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, TrendingUp, Users, X, Image, Upload } from 'lucide-react';
import PostCard from '../components/PostCard';
import api from '../lib/api';
import { uploadImage } from '../lib/upload';
import type { Post } from '../lib/types';

interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  isVerified: boolean;
  _count: { followers: number; posts: number };
}

interface TrendingTag {
  id: string;
  name: string;
  postsCount: number;
}

interface FeedViewProps {
  onViewProfile?: (username: string) => void;
}

export default function FeedView({ onViewProfile }: FeedViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [postsRes, storiesRes, exploreRes] = await Promise.all([
          api.get('/posts'),
          api.get('/stories'),
          api.get('/explore'),
        ]);
        setPosts(postsRes.data?.data || postsRes.data || []);
        setStories(storiesRes.data?.data || storiesRes.data || []);
        const explore = exploreRes.data?.data || exploreRes.data || {};
        setTrendingTags(explore.trendingHashtags || []);
        setSuggestedUsers(explore.suggestedUsers || []);
      } catch (err) {
        console.error('Failed to load feed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/search/users?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data?.data || res.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  async function handleFollow(userId: string) {
    try {
      await api.post(`/users/${userId}/follow`);
      setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
    } catch {}
  }

  async function handleCreatePost() {
    if (!newCaption.trim() && !newImageUrl.trim() && !imageFile) return;
    setCreating(true);
    try {
      let mediaUrl = newImageUrl;
      if (imageFile) {
        setUploading(true);
        mediaUrl = await uploadImage(imageFile);
        setUploading(false);
      }
      await api.post('/posts', {
        caption: newCaption,
        type: mediaUrl ? 'PHOTO' : 'TEXT',
        media: mediaUrl ? [{ url: mediaUrl, type: 'IMAGE', orderIndex: 0 }] : [],
      });
      setShowCreate(false);
      setNewCaption('');
      setNewImageUrl('');
      setImageFile(null);
      const res = await api.get('/posts');
      setPosts(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setCreating(false);
      setUploading(false);
    }
  }

  return (
    <div className="h-full overflow-hidden flex font-body">
      <div className="flex-1 overflow-y-auto scrollbar-hidden px-5 py-5">
        {/* Stories */}
        <div className="flex gap-3 mb-5 overflow-x-auto scrollbar-hidden pb-1">
          {stories.map((s: any, i: number) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.08 }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer"
            >
              {s.user?.profilePicture ? (
                <div className="w-[52px] h-[52px] p-0.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <img src={s.user.profilePicture} className="w-full h-full rounded-full object-cover" />
                </div>
              ) : (
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple-500/50">
                  {(s.user?.displayName || s.user?.username || '?').slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-white/45 text-[11px] truncate w-13 text-center" style={{ maxWidth: 52 }}>
                {s.user?.username || 'user'}
              </span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="flex-shrink-0 flex flex-col items-center gap-1.5"
          >
            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center bg-white/[.05] border-2 border-dashed border-white/[.18] hover:bg-white/[.08] transition-colors cursor-pointer">
              <Plus size={18} className="text-white/40" />
            </div>
            <span className="text-white/30 text-[11px]">Add</span>
          </motion.div>
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-5 max-w-lg">
          {/* Create post button */}
          <button
            onClick={() => setShowCreate(true)}
            className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[.08] transition-colors cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
              <Plus size={18} className="text-white" />
            </div>
            <span className="text-white/50 text-sm">Create a post...</span>
          </button>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-[38px] h-[38px] rounded-full bg-white/[.06]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded bg-white/[.06]" />
                    <div className="h-2.5 w-16 rounded bg-white/[.04]" />
                  </div>
                </div>
                <div className="h-[268px] bg-white/[.04]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-full rounded bg-white/[.06]" />
                  <div className="h-3 w-3/4 rounded bg-white/[.04]" />
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-white/50 text-lg font-semibold">No posts yet</p>
              <p className="text-white/30 text-sm mt-1">Be the first to create a post!</p>
            </div>
          ) : (
            posts.map((post, i) => (
              <PostCard key={post.id} post={post} delay={i} onViewProfile={onViewProfile} />
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden xl:flex flex-col w-[292px] p-5 gap-4 overflow-y-auto scrollbar-hidden flex-shrink-0 border-l border-white/[.05]">
        {/* Search */}
        <div className="glass rounded-xl flex items-center gap-2.5 px-4 py-3">
          <Search size={15} className="text-white/35 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search users..."
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30"
          />
          {searchQuery && (
            <button onClick={() => handleSearch('')} className="flex-shrink-0">
              <X size={14} className="text-white/35" />
            </button>
          )}
        </div>

        {searchQuery ? (
          <div className="glass rounded-2xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Search Results</h3>
            {searching ? (
              <p className="text-white/30 text-xs">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-white/30 text-xs">No users found</p>
            ) : (
              searchResults.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 py-2.5 border-b border-white/[.04] last:border-0 cursor-pointer"
                  onClick={() => onViewProfile?.(u.username)}
                >
                  {u.profilePicture ? (
                    <img src={u.profilePicture} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple-500 flex-shrink-0">
                      {(u.displayName || u.username).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{u.displayName || u.username}</div>
                    <div className="text-white/35 text-xs">@{u.username}</div>
                  </div>
                  <button
                    onClick={() => handleFollow(u.id)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 flex-shrink-0"
                  >
                    Follow
                  </button>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Trending */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-purple-300" /> Trending
              </h3>
              {trendingTags.length === 0 ? (
                <p className="text-white/30 text-xs">No trending tags yet</p>
              ) : (
                trendingTags.slice(0, 5).map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center justify-between py-2.5 border-b border-white/[.04] last:border-0 cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">#{t.name}</div>
                      <div className="text-white/35 text-xs">{t.postsCount} posts</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Suggested */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Users size={15} className="text-purple-300" /> Suggested
              </h3>
              {suggestedUsers.length === 0 ? (
                <p className="text-white/30 text-xs">No suggestions yet</p>
              ) : (
                suggestedUsers.slice(0, 3).map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                    onClick={() => onViewProfile?.(u.username)}
                  >
                    {u.profilePicture ? (
                      <img src={u.profilePicture} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple-500 flex-shrink-0">
                        {(u.displayName || u.username).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{u.displayName || u.username}</div>
                      <div className="text-white/35 text-xs">{u._count?.followers || 0} followers</div>
                    </div>
                    <button
                      onClick={() => handleFollow(u.id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 flex-shrink-0"
                    >
                      Follow
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Create Post</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <textarea
              value={newCaption}
              onChange={e => setNewCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full bg-white/[.06] border border-white/[.08] rounded-xl p-3 text-white text-sm outline-none placeholder:text-white/30 resize-none h-24"
            />
            <div className="flex items-center gap-3 mt-3 mb-4">
              <Image size={16} className="text-white/35" />
              <input
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Image URL (optional)"
                className="flex-1 bg-white/[.06] border border-white/[.08] rounded-xl px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"
              />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Upload size={16} className="text-white/35" />
              <label className="flex-1 cursor-pointer">
                <div className="border border-dashed border-white/[.15] rounded-xl px-3 py-2 text-sm text-white/40 hover:text-white/60 hover:border-white/30 transition-colors text-center">
                  {imageFile ? imageFile.name : 'Choose image file...'}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <button
              onClick={handleCreatePost}
              disabled={creating || uploading || (!newCaption.trim() && !newImageUrl.trim() && !imageFile)}
              className="w-full py-3 rounded-2xl text-white font-bold text-base disabled:opacity-50 bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ boxShadow: '0 0 28px rgba(139,92,246,.4)' }}
            >
              {uploading ? 'Uploading...' : creating ? 'Posting...' : 'Post'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
