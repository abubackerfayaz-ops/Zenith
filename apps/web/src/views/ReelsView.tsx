import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Music, Plus, X, Upload } from 'lucide-react';
import api from '../lib/api';
import { uploadVideo } from '../lib/upload';
import { formatNumber } from '../lib/utils';

export default function ReelsView() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [index, setIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/reels');
        setReels(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load reels:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const reel = reels[index];

  async function handleLike() {
    if (!reel) return;
    try {
      if (liked) {
        await api.delete(`/reels/${reel.id}/like`);
        setReels(prev => prev.map((r, i) => i === index ? { ...r, likesCount: Math.max(0, r.likesCount - 1) } : r));
      } else {
        await api.post(`/reels/${reel.id}/like`);
        setReels(prev => prev.map((r, i) => i === index ? { ...r, likesCount: r.likesCount + 1 } : r));
      }
      setLiked(!liked);
    } catch {}
  }

  async function handleUpload() {
    if (!videoUrl.trim() && !videoFile) return;
    setUploading(true);
    try {
      let url = videoUrl;
      if (videoFile) url = await uploadVideo(videoFile);
      await api.post('/reels', {
        caption,
        type: 'VIDEO',
        media: [{ url, type: 'VIDEO', orderIndex: 0 }],
      });
      setShowUpload(false);
      setCaption('');
      setVideoUrl('');
      setVideoFile(null);
      const res = await api.get('/reels');
      setReels(res.data?.data || res.data || []);
      setIndex(0);
    } catch (err) {
      console.error('Failed to upload reel:', err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="h-full flex overflow-hidden font-body">
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#0a0520] via-[#050e1a] to-[#03100e]">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,.35) 0%, transparent 55%), radial-gradient(ellipse at 70% 65%, rgba(6,182,212,.22) 0%, transparent 55%)' }} />

        {/* Upload button */}
        <button
          onClick={() => setShowUpload(true)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-black/45 backdrop-blur-xl hover:bg-black/60 transition-colors"
        >
          <Plus size={20} className="text-white" />
        </button>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/40 animate-pulse">Loading reels...</p>
          </div>
        ) : !reel ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <p className="text-white/50 text-lg font-semibold">No reels yet</p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-6 py-3 rounded-2xl text-white font-bold bg-gradient-to-r from-purple-500 to-indigo-500"
            >
              Upload your first reel
            </button>
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-4 right-4 h-[3px] rounded-full bg-white/[.18] overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((index + 1) / reels.length) * 100}%` }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 bg-gradient-to-t from-black/88 to-transparent">
              <div className="flex items-start gap-3 mb-3">
                {reel.user?.profilePicture ? (
                  <img src={reel.user.profilePicture} className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/50" />
                ) : (
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-purple-500/50">
                    {(reel.user?.displayName || reel.user?.username || '?').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-white font-bold text-base">{reel.user?.username}</div>
                  {reel.caption && <p className="text-white/65 text-sm mt-0.5 leading-snug">{reel.caption}</p>}
                </div>
                <button className="px-4 py-1.5 rounded-full text-sm font-bold text-white flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500">
                  Follow
                </button>
              </div>
            </div>

            <div className="absolute right-4 bottom-36 flex flex-col items-center gap-5">
              <button onClick={handleLike} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/45 backdrop-blur-xl">
                  <Heart size={22} fill={liked ? '#EC4899' : 'none'} className={liked ? 'text-pink-500' : 'text-white'} />
                </div>
                <span className="text-white text-xs font-medium">{formatNumber(reel.likesCount || 0)}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/45 backdrop-blur-xl">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <span className="text-white text-xs font-medium">{reel.commentsCount || 0}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/45 backdrop-blur-xl">
                  <Share2 size={20} className="text-white" />
                </div>
                <span className="text-white text-xs font-medium">Share</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/45 backdrop-blur-xl">
                  <Bookmark size={20} className="text-white" />
                </div>
                <span className="text-white text-xs font-medium">Save</span>
              </button>
            </div>
          </>
        )}

        {reels.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {reels.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => { setIndex(i); setLiked(false); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-purple-500 w-4' : 'bg-white/[.3]'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:flex w-[300px] flex-col p-4 gap-3 overflow-y-auto scrollbar-hidden border-l border-white/[.06] flex-shrink-0 glass">
        <h2 className="text-white font-bold text-base">Reels</h2>
        <p className="text-white/30 text-sm">Click the + button to upload your own reel</p>
        {reels.length > 0 && (
          <div className="mt-2">
            <h3 className="text-white/65 text-xs font-semibold mb-2">All Reels</h3>
            <div className="flex flex-col gap-2">
              {reels.map((r: any, i: number) => (
                <button
                  key={r.id}
                  onClick={() => { setIndex(i); setLiked(false); }}
                  className={`text-left px-3 py-2 rounded-xl text-sm transition-colors ${i === index ? 'bg-purple-500/20 text-purple-300' : 'text-white/50 hover:bg-white/[.05]'}`}
                >
                  {r.user?.username} — {r.caption?.slice(0, 30) || 'No caption'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Upload Reel</h2>
              <button onClick={() => setShowUpload(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full bg-white/[.06] border border-white/[.08] rounded-xl p-3 text-white text-sm outline-none placeholder:text-white/30 resize-none h-24"
            />
            <div className="flex items-center gap-3 mt-3 mb-2">
              <Upload size={16} className="text-white/35" />
              <input
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Video URL (optional)"
                className="flex-1 bg-white/[.06] border border-white/[.08] rounded-xl px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"
              />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Music size={16} className="text-white/35" />
              <label className="flex-1 cursor-pointer">
                <div className="border border-dashed border-white/[.15] rounded-xl px-3 py-2 text-sm text-white/40 hover:text-white/60 hover:border-white/30 transition-colors text-center">
                  {videoFile ? videoFile.name : 'Choose video file...'}
                </div>
                <input type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || (!videoUrl.trim() && !videoFile)}
              className="w-full py-3 rounded-2xl text-white font-bold text-base disabled:opacity-50 bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ boxShadow: '0 0 28px rgba(139,92,246,.4)' }}
            >
              {uploading ? 'Uploading...' : 'Upload Reel'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
