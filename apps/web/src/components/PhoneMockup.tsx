import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const DEMO_AVATARS = [
  { ini: 'A', color: '#8B5CF6', name: 'alex' },
  { ini: 'Z', color: '#EC4899', name: 'zoe' },
  { ini: 'M', color: '#06B6D4', name: 'max' },
  { ini: 'L', color: '#10B981', name: 'luna' },
];

export default function PhoneMockup() {
  return (
    <div className="relative" style={{ perspective: 1200 }}>
      <motion.div
        initial={{ rotateY: -18, rotateX: 5 }}
        whileHover={{ rotateY: -8, rotateX: 2 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          style={{
            width: 272,
            height: 552,
            borderRadius: 42,
            background: 'linear-gradient(145deg, #1c1c40, #0d0d26)',
            border: '1px solid rgba(255,255,255,.18)',
            boxShadow: '0 40px 80px rgba(0,0,0,.85), 0 0 60px rgba(139,92,246,.25), inset 0 1px 0 rgba(255,255,255,.12)',
            position: 'relative',
          }}
        >
          <div className="absolute inset-9 rounded-[34px] bg-background overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[26px] bg-[#0d0d26] rounded-b-[18px] z-10" />
            <div className="p-3 pt-9">
              <div className="flex gap-2 mb-2.5">
                {DEMO_AVATARS.map((c, i) => (
                  <div key={c.ini} className="flex flex-col items-center gap-0.5">
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{ width: 38, height: 38, padding: 2, background: `linear-gradient(135deg, ${c.color}, #EC4899)` }}
                    >
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: `${c.color}55` }}
                      >
                        {c.ini}
                      </div>
                    </div>
                    <span className="text-[7px] text-white/40">{c.name}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl overflow-hidden bg-white/[.05] border border-white/[.07] mb-2">
                <div className="flex items-center gap-1.5 p-[7px] px-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white bg-gradient-to-br from-purple-500 to-pink-500">A</div>
                  <div>
                    <div className="text-[8px] text-white font-semibold">Alex</div>
                    <div className="text-[7px] text-white/40">Creator</div>
                  </div>
                </div>
                <div className="h-[100px]" style={{ background: 'linear-gradient(135deg, #1a0538, #0d2238, #051a2a)' }} />
                <div className="p-2 px-2 flex gap-2">
                  <Heart size={11} className="text-pink-500" />
                  <MessageCircle size={11} className="text-white/40" />
                  <Share2 size={11} className="text-white/40" />
                </div>
              </div>
              <div className="rounded-[10px] p-2.5 bg-white/[.04]">
                <div className="flex justify-between text-[7.5px] text-white/50 mb-1.5">
                  <span>🔥 Viral Predictor</span>
                  <span className="text-emerald-400">87%</span>
                </div>
                <div className="h-1 rounded-sm bg-white/[.1] overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: '87%',
                      background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                      boxShadow: '0 0 6px rgba(139,92,246,.6)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-20"
              style={{ background: 'linear-gradient(0deg, rgba(139,92,246,.35), transparent)' }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
