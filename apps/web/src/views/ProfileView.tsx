import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Eye, Grid3X3, Bookmark, Award } from 'lucide-react';
import FameRing from '../components/FameRing';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import type { Post } from '../lib/types';

interface ProfileViewProps {
  username?: string | null;
  onViewProfile?: (username: string) => void;
}

export default function ProfileView({ username, onViewProfile }: ProfileViewProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'saved'>('posts');

  const targetUser = username || user?.username;

  useEffect(() => {
    if (!targetUser) return;
    async function load() {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${targetUser}`),
          api.get(`/posts/user/${targetUser}`),
        ]);
        setProfile(profileRes.data?.data || profileRes.data || null);
        setPosts(postsRes.data?.data || postsRes.data || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetUser]);

  if (!user) return null;

  const u = profile || user;
  const initials = (u.displayName || u.username).slice(0, 2).toUpperCase();
  const followerCount = u._count?.following ?? 0;
  const followingCount = u._count?.followers ?? 0;

  const isOwnProfile = !username || username === user?.username;

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden font-body relative">
      {!isOwnProfile && (
        <button onClick={() => onViewProfile?.(user!.username)} className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors">
          &larr; My Profile
        </button>
      )}
      {/* Banner */}
      <div className="relative h-52 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0538] via-[#0d2238] to-[#0d0538]" />
        <div className="absolute inset-0 opacity-50" style={{ background: 'radial-gradient(circle at 25% 50%, #7C3AED 0%, transparent 55%), radial-gradient(circle at 75% 30%, #0891B2 0%, transparent 55%)' }} />
        {profile?.coverImage && (
          <img src={profile.coverImage} className="w-full h-full object-cover opacity-40" />
        )}
      </div>

      <div className="px-6 lg:px-8 pb-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-14 mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="float w-[100px] h-[100px] rounded-3xl flex items-center justify-center text-3xl font-black text-white relative flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 font-display overflow-hidden"
            style={{ boxShadow: '0 0 50px rgba(139,92,246,.55)' }}
          >
            {u.profilePicture ? (
              <img src={u.profilePicture} className="w-full h-full object-cover" />
            ) : initials}
          </motion.div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-white text-2xl font-black font-display">{u.displayName || u.username}</h1>
              {u.isVerified && <CheckCircle size={18} className="text-cyan-400" />}
            </div>
            <p className="text-white/45 mb-1 text-sm">@{u.username}</p>
            {u.bio && <p className="text-white/65 text-sm max-w-md">{u.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 mb-5">
          {[
            { label: 'Posts', value: posts.length.toString(), color: '#A78BFA' },
            { label: 'Followers', value: followerCount.toString(), color: '#60A5FA' },
            { label: 'Following', value: followingCount.toString(), color: '#34D399' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="glass rounded-xl p-3 text-center"
            >
              <div className="font-black text-base mb-0.5 font-display" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/35 text-[11px]">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-5 bg-white/[.05]">
          {(['posts', 'saved'] as const).map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all flex items-center gap-2 ${tab === t ? 'text-white bg-gradient-to-r from-purple-500 to-indigo-500' : 'text-white/45 hover:text-white/70'}`}
            >
              {t === 'posts' ? <Grid3X3 size={14} /> : <Bookmark size={14} />}
              {t}
            </motion.button>
          ))}
        </div>

        {tab === 'posts' && (
          loading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/[.04] animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Award size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-lg font-semibold">No posts yet</p>
              <p className="text-white/30 text-sm mt-1">Your posts will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group bg-[#1a1a3e]"
                >
                  {post.media?.[0]?.url ? (
                    <img src={post.media[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">{post.type}</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 bg-black/55">
                    <Eye size={14} className="text-white" />
                    <span className="text-white text-[10px]">{post.likesCount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}

        {tab === 'saved' && (
          <div className="glass rounded-2xl p-8 text-center">
            <Bookmark size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-lg font-semibold">No saved posts</p>
            <p className="text-white/30 text-sm mt-1">Save posts to view them later</p>
          </div>
        )}
      </div>
    </div>
  );
}
