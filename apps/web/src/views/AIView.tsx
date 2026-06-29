import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Star, Target } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';

export default function AIView() {
  const { user } = useAuth();
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await api.get(`/ai/fame-score/${user.id}`);
        setScore(res.data?.data || res.data || null);
      } catch {
        // not available
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden p-5 lg:p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-cyan-400">
            <Brain size={19} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-black font-display">AI Studio</h1>
            <p className="text-white/40 text-sm">Powered by Zenith Intelligence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Fame Score */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Star size={15} className="text-amber-400" /> Fame Score
            </h3>
            {loading ? (
              <div className="h-24 flex items-center justify-center">
                <p className="text-white/30 animate-pulse">Loading...</p>
              </div>
            ) : score ? (
              <div className="flex items-center gap-6">
                <div className="w-[116px] h-[116px] rounded-full flex items-center justify-center font-black text-3xl text-white font-display bg-gradient-to-br from-purple-500 to-pink-500" style={{ boxShadow: '0 0 40px rgba(139,92,246,.4)' }}>
                  {score.score || '?'}
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-black text-white mb-1 font-display">{score.score || 0}</div>
                  <div className="text-sm font-semibold mb-3.5 text-amber-400">Fame Score</div>
                  {[
                    ['Engagement', score.engagementScore, '#EC4899'],
                    ['Virality', score.viralPotential, '#06B6D4'],
                    ['Consistency', score.consistencyScore, '#10B981'],
                  ].map(([l, v, c]) => (
                    <div key={l as string} className="flex items-center gap-2 mb-2 last:mb-0">
                      <span className="text-white/40 text-xs w-24">{l as string}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[.07]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(v as number) || 0}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full" style={{ background: c as string }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-6 text-right" style={{ color: c as string }}>{v || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-sm">No fame score data yet. Start creating content to build your score.</p>
            )}
          </div>

          {/* AI Suggestions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Target size={15} className="text-cyan-400" /> AI Insights
            </h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Post consistently and engage with your audience to improve your Fame Score. 
              Use trending hashtags and create original content to maximize reach.
            </p>
            <div className="mt-6 space-y-3">
              {['Post at peak hours (6-9 PM)', 'Use 3-5 relevant hashtags', 'Reply to comments within 1 hour', 'Collab with similar creators'].map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-white/50">{tip}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
