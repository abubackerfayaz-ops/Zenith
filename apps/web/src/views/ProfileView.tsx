import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Eye, Grid3X3, Bookmark, Award, Settings, UserPlus, UserMinus } from 'lucide-react';
import FameRing from '../components/FameRing';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import type { Post } from '../lib/types';

interface ProfileViewProps {
  username?: string | null;
  onViewProfile?: (username: string) => void;
  onChangeView?: (v: any) => void;
}

export default function ProfileView({ username, onViewProfile, onChangeView }: ProfileViewProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'saved'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

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
        const p = profileRes.data?.data || profileRes.data || null;
        setProfile(p);
        setIsFollowing(p?.isFollowing || false);
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
  const followerCount = u._count?.followers ?? 0;
  const followingCount = u._count?.following ?? 0;

  const isOwnProfile = !username || username === user?.username;

  async function handleFollow() {
    if (followLoading || !u.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/users/${u.id}/follow`);
        setIsFollowing(false);
        setProfile((prev: any) => prev ? { ...prev, _count: { ...prev._count, followers: Math.max(0, (prev._count?.followers ?? 1) - 1) } } : prev);
      } else {
        await api.post(`/users/${u.id}/follow`);
        setIsFollowing(true);
        setProfile((prev: any) => prev ? { ...prev, _count: { ...prev._count, followers: (prev._count?.followers ?? 0) + 1 } } : prev);
      }
    } catch (err) {
      console.error('Follow failed:', err);
    } finally {
      setFollowLoading(false);
    }
  }

  function handleStartChat() {
    if (!u.id) return;
    api.post('/chats', { participantIds: [u.id] }).then(() => {
      onChangeView?.('messages');
    }).catch(() => {});
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden font-body relative">
      {!isOwnProfile && (
        <button onClick={() => onChangeView?.('feed')} className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors">
          &larr; Back
        </button>
      )}
      {/* Banner */}
      <div className="relative h-44 sm:h-52 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0538] via-[#0d2238] to-[#0d0538]" />
        <div className="absolute inset-0 opacity-50" style={{ background: 'radial-gradient(circle at 25% 50%, #7C3AED 0%, transparent 55%), radial-gradient(circle at 75% 30%, #0891B2 0%, transparent 55%)' }} />
        {profile?.coverImage && (
          <img src={profile.coverImage} className="w-full h-full object-cover opacity-40" />
        )}
        {isOwnProfile && (
          <button
            onClick={() => onChangeView?.('settings')}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white bg-white/10 hover:bg-white/20 transition-all"
          >
            <Settings size={16} />
          </button>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-10 relative">
        {/* Avatar overlapping banner bottom */}
        <div className="relative h-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-[100px] h-[100px] rounded-3xl flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-purple-500 to-pink-500 font-display overflow-hidden absolute -top-14 left-0"
            style={{ boxShadow: '0 0 50px rgba(139,92,246,.55)' }}
          >
            {u.profilePicture ? (
              <img src={u.profilePicture} className="w-full h-full object-cover" />
            ) : initials}
          </motion.div>
        </div>

        {/* Info row */}
        <div className="mt-12">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-white text-2xl font-black font-display">{u.displayName || u.username}</h1>
            {u.isVerified && <CheckCircle size={18} className="text-cyan-400" />}
            {u.founderBadge && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Founder</span>}
          </div>
          <p className="text-white/45 mb-3 text-sm">@{u.username}</p>
          {u.bio && <p className="text-white/65 text-sm max-w-md mb-3">{u.bio}</p>}

          {/* Follow / Message buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2 mb-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  isFollowing
                    ? 'bg-white/[.08] text-white border border-white/[.12] hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                }`}
              >
                {isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </motion.button>
              <button
                onClick={handleStartChat}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-white/[.08] text-white border border-white/[.12] hover:bg-white/[.12] transition-all"
              >
                Message
              </button>
            </div>
          )}

          {/* ZP Balance */}
          {(u.zenithPoints ?? 0) > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4">
              <span className="text-yellow-400 text-sm font-bold">⭐ {u.zenithPoints.toLocaleString()} ZP</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { label: 'Posts', value: (u._count?.posts ?? posts.length).toString(), color: '#A78BFA' },
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
              <p className="text-white/30 text-sm mt-1">Posts will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2">
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
