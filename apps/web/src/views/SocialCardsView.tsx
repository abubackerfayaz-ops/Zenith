import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';

export default function SocialCardsView() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/wallet');
        setWallet(res.data?.data || res.data || null);
      } catch {}
    }
    load();
  }, []);

  const initials = (user?.displayName || user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="h-full overflow-y-auto scrollbar-hidden p-5 lg:p-8 font-body">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-orange-400">
            <Share2 size={19} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-black font-display">Social Cards</h1>
            <p className="text-white/40 text-sm">Share your Zenith profile everywhere</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
          {/* Profile Card */}
          <div className="flex flex-col gap-3">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative rounded-3xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: '4/5', background: 'linear-gradient(135deg,#7C3AED 0%,#2563EB 50%,#0891B2 100%)', boxShadow: '0 24px 64px rgba(0,0,0,.55)' }}
            >
              <div className="absolute inset-0 bg-black/[.12]" />
              <div className="absolute inset-0 opacity-[.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <div className="absolute inset-0 p-5 flex flex-col">
                <div className="flex items-center justify-between mb-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-white text-xs bg-white/[.22] font-display">Z</div>
                    <span className="text-white/80 text-xs font-bold">Zenith</span>
                  </div>
                  <span className="text-white/60 text-[11px] px-2 py-0.5 rounded-full font-medium bg-white/[.14]">Creator</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} className="w-20 h-20 rounded-2xl object-cover mb-3 ring-2 ring-white/30" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white bg-white/20 mb-3">{initials}</div>
                  )}
                  <div className="text-white font-black mb-0.5 font-display text-xl">{user?.displayName || user?.username}</div>
                  <div className="text-white/70 text-sm">@{user?.username}</div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-white/60">
                    <span>{wallet?.coins || 0} coins</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="flex gap-1.5">
              {['WhatsApp', 'Instagram', 'X'].map((s) => (
                <button key={s} className="flex-1 py-2 rounded-xl text-[11px] font-semibold text-white/70 hover:text-white transition-colors glass">{s}</button>
              ))}
              <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/25 border border-purple-500/35">
                <Download size={13} className="text-purple-300" />
              </button>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="flex flex-col gap-3">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative rounded-3xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: '4/5', background: 'linear-gradient(135deg,#F59E0B 0%,#EF4444 50%,#EC4899 100%)', boxShadow: '0 24px 64px rgba(0,0,0,.55)' }}
            >
              <div className="absolute inset-0 bg-black/[.12]" />
              <div className="absolute inset-0 p-5 flex flex-col">
                <div className="flex items-center justify-between mb-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-white text-xs bg-white/[.22] font-display">Z</div>
                    <span className="text-white/80 text-xs font-bold">Zenith</span>
                  </div>
                  <span className="text-white/60 text-[11px] px-2 py-0.5 rounded-full font-medium bg-white/[.14]">Wallet</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="text-white/65 text-xs mb-1.5 font-medium">Zenith Balance</div>
                  <div className="text-white font-black mb-1 font-display" style={{ fontSize: '2.4rem', textShadow: '0 0 30px rgba(255,255,255,.25)' }}>
                    {wallet?.coins || 0}
                  </div>
                  <div className="text-white/80 text-sm font-semibold">Coins</div>
                  {wallet?.revenue > 0 && (
                    <div className="mt-2 text-white/60 text-xs">${wallet.revenue.toFixed(2)} earned</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
