import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Share2, Bookmark, MoreHorizontal,
  CheckCircle,
} from 'lucide-react';
import CommentSection from './CommentSection';
import Avatar from './Avatar';
import api from '../lib/api';
import type { Post } from '../lib/types';

interface PostCardProps {
  post: Post;
  delay?: number;
  onViewProfile?: (username: string) => void;
}

export default function PostCard({ post, delay = 0, onViewProfile }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);

  const img = post.media?.[0]?.url;
  const initials = (post.user.displayName || post.user.username).slice(0, 2).toUpperCase();

  async function toggleLike() {
    try {
      if (liked) {
        await api.delete(`/posts/${post.id}/like`);
        setLikes(l => l - 1);
      } else {
        await api.post(`/posts/${post.id}/like`);
        setLikes(l => l + 1);
      }
      setLiked(!liked);
    } catch {}
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass rounded-2xl overflow-hidden hover-lift"
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button onClick={() => onViewProfile?.(post.user.username)} className="flex-shrink-0">
          {post.user.profilePicture ? (
            <img src={post.user.profilePicture} className="w-[38px] h-[38px] rounded-full object-cover" />
          ) : (
            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-xs font-bold text-white bg-purple-500">{initials}</div>
          )}
        </button>
        <button onClick={() => onViewProfile?.(post.user.username)} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-semibold text-sm">{post.user.displayName || post.user.username}</span>
            {post.user.isVerified && <CheckCircle size={13} className="text-cyan-400" />}
          </div>
          <span className="text-white/40 text-xs">@{post.user.username}</span>
        </button>
        <button className="text-white/25 hover:text-white/60 transition-colors ml-1">
          <MoreHorizontal size={17} />
        </button>
      </div>

      {img && (
        <div className="relative group">
          <img
            src={img}
            alt="Post content"
            className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ height: 268, background: '#1a1a3e' }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      <div className="px-4 pt-2.5 pb-1">
        <p className="text-white/75 text-sm leading-relaxed">
          <button onClick={() => onViewProfile?.(post.user.username)} className="text-white font-semibold hover:underline inline">@{post.user.username}</button>{' '}
          {post.caption}
        </p>
      </div>

      <div className="flex items-center gap-4 px-4 py-3">
        <motion.button
          onClick={toggleLike}
          whileTap={{ scale: 1.3 }}
          className="flex items-center gap-1.5 text-sm transition-all"
        >
          <Heart
            size={19}
            fill={liked ? '#EC4899' : 'none'}
            className={liked ? 'text-pink-500 drop-shadow-[0_0_6px_#EC4899]' : 'text-white/45'}
          />
          <span className="text-white/50 text-xs">{likes}</span>
        </motion.button>
        <CommentSection postId={post.id} count={commentsCount} onCountChange={d => setCommentsCount(c => c + d)} />
        <button className="flex items-center gap-1.5 text-sm">
          <Share2 size={19} className="text-white/45" />
          <span className="text-white/50 text-xs">Share</span>
        </button>
        <motion.button
          onClick={() => setSaved(!saved)}
          whileTap={{ scale: 1.3 }}
          className="ml-auto transition-all"
        >
          <Bookmark
            size={19}
            fill={saved ? '#8B5CF6' : 'none'}
            className={saved ? 'text-purple-500 drop-shadow-[0_0_6px_#8B5CF6]' : 'text-white/45'}
          />
        </motion.button>
      </div>
    </motion.div>
  );
}
