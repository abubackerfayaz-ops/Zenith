import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Crown, Star, Trophy } from 'lucide-react';
import api from '../lib/api';

export default function BattlesView() {
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/battles/active');
        setBattles(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load battles:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleVote(battleId: string, participantId: string) {
    try {
      await api.post(`/battles/${battleId}/vote/${participantId}`);
      setVoted(participantId);
    } catch {}
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden p-5 lg:p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500">
            <Zap size={19} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-black font-display">Creator Battles</h1>
            <p className="text-white/40 text-sm">Compete, vote, and earn glory</p>
          </div>
        </div>

        {loading ? (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-white/40 animate-pulse">Loading battles...</p>
          </div>
        ) : battles.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-white/50 text-lg font-semibold">No active battles</p>
            <p className="text-white/30 text-sm mt-1">Create a battle or join one to get started</p>
          </div>
        ) : (
          battles.map((battle: any, bi: number) => {
            const participants = battle.participants || battle.participants || [];
            if (participants.length < 2) return null;
            const [p1, p2] = participants;
            const v1 = p1.votesCount || 0;
            const v2 = p2.votesCount || 0;
            const total = v1 + v2 || 1;
            const pc1 = Math.round((v1 / total) * 100);
            const pc2 = 100 - pc1;

            return (
              <div key={battle.id} className="glass rounded-3xl overflow-hidden mb-7" style={{ boxShadow: '0 0 60px rgba(139,92,246,.12)' }}>
                <div className="px-6 py-3.5 border-b border-white/[.05] flex items-center justify-between">
                  <span className="text-white/50 text-sm">{battle.title}</span>
                  <span className="text-sm font-bold text-orange-400">🏆 {battle.prize || 'No prize'}</span>
                </div>

                <div className="grid grid-cols-[1fr,auto,1fr]">
                  <div className="p-7 flex flex-col items-center bg-gradient-to-br from-purple-500/[.09] to-transparent">
                    <div className="relative mb-4">
                      {p1.user?.profilePicture ? (
                        <img src={p1.user.profilePicture} className="w-[84px] h-[84px] rounded-2xl object-cover" style={{ boxShadow: '0 0 45px rgba(139,92,246,.55)' }} />
                      ) : (
                        <div className="w-[84px] h-[84px] rounded-2xl flex items-center justify-center text-3xl font-black text-white font-display bg-gradient-to-br from-purple-500 to-pink-500" style={{ boxShadow: '0 0 45px rgba(139,92,246,.55)' }}>
                          {(p1.user?.displayName || p1.user?.username || '?').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {pc1 > pc2 && voted && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center bg-amber-400">
                          <Crown size={13} className="text-white" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-white text-lg font-black mb-0.5 font-display">{p1.user?.displayName || p1.user?.username}</h2>
                    <p className="text-white/40 text-xs mb-2">@{p1.user?.username}</p>
                    {!voted ? (
                      <button
                        onClick={() => handleVote(battle.id, p1.id)}
                        className="px-7 py-2.5 rounded-2xl text-white font-black text-base bg-gradient-to-r from-purple-500 to-indigo-500"
                        style={{ boxShadow: '0 0 30px rgba(139,92,246,.45)' }}
                      >
                        Vote
                      </button>
                    ) : (
                      <div className="text-3xl font-black font-display text-purple-500">{pc1}%</div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center px-3">
                    <div className="h-20 w-px bg-gradient-to-b from-transparent via-white/[.12] to-transparent" />
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base text-white font-display bg-gradient-to-br from-pink-500 to-purple-500"
                      style={{ boxShadow: '0 0 28px rgba(236,72,153,.45)' }}>
                      VS
                    </div>
                    <div className="h-20 w-px bg-gradient-to-b from-white/[.12] to-transparent" />
                  </div>

                  <div className="p-7 flex flex-col items-center bg-gradient-to-tl from-pink-500/[.09] to-transparent">
                    <div className="relative mb-4">
                      {p2.user?.profilePicture ? (
                        <img src={p2.user.profilePicture} className="w-[84px] h-[84px] rounded-2xl object-cover" style={{ boxShadow: '0 0 45px rgba(236,72,153,.55)' }} />
                      ) : (
                        <div className="w-[84px] h-[84px] rounded-2xl flex items-center justify-center text-3xl font-black text-white font-display bg-gradient-to-br from-pink-500 to-orange-400" style={{ boxShadow: '0 0 45px rgba(236,72,153,.55)' }}>
                          {(p2.user?.displayName || p2.user?.username || '?').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h2 className="text-white text-lg font-black mb-0.5 font-display">{p2.user?.displayName || p2.user?.username}</h2>
                    <p className="text-white/40 text-xs mb-2">@{p2.user?.username}</p>
                    {!voted ? (
                      <button
                        onClick={() => handleVote(battle.id, p2.id)}
                        className="px-7 py-2.5 rounded-2xl text-white font-black text-base bg-gradient-to-r from-pink-500 to-rose-600"
                        style={{ boxShadow: '0 0 30px rgba(236,72,153,.45)' }}
                      >
                        Vote
                      </button>
                    ) : (
                      <div className="text-3xl font-black font-display text-pink-500">{pc2}%</div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {voted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="px-6 pb-5 border-t border-white/[.04] pt-4 overflow-hidden"
                    >
                      <div className="flex text-xs text-white/35 justify-between mb-2">
                        <span>{v1} votes</span>
                        <span>{total} total</span>
                        <span>{v2} votes</span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden flex bg-white/[.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pc1}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-l-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pc2}%` }}
                          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                          className="h-full rounded-r-full bg-gradient-to-r from-pink-500 to-rose-600"
                        />
                      </div>
                      <p className="text-center text-white/40 text-xs mt-2">✓ Your vote has been counted</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
