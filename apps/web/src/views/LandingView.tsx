import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Play, Flame, Brain, Zap,
  DollarSign, ChevronRight, CheckCircle,
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/PageTransition';
import PhoneMockup from '../components/PhoneMockup';
import FameRing from '../components/FameRing';
import { FEATURES, STATS } from '../lib/constants';
import type { View } from '../lib/types';

const iconMap: Record<string, React.ElementType> = {
  Flame, Brain, Zap, DollarSign,
};

interface LandingViewProps {
  onChange: (v: View) => void;
}

export default function LandingView({ onChange }: LandingViewProps) {
  return (
    <div className="h-full overflow-y-auto scrollbar-hidden font-body">
      {/* Hero */}
      <section className="min-h-screen flex items-center px-6 lg:px-14 py-16">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-7 bg-purple-500/[.14] border border-purple-500/32 text-purple-300">
                <Sparkles size={13} /> The AI Social Platform · Now in Beta
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-black leading-[.93] mb-5 font-display" style={{ fontSize: 'clamp(3.6rem, 7.5vw, 6.8rem)' }}>
                <span className="text-gradient shimmer-text">ZENITH</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-2xl font-bold text-white/90 mb-3 font-display tracking-wide">
                Create. Compete. Go Viral.
              </p>
              <p className="text-white/50 text-lg mb-9 max-w-md leading-relaxed">
                Where creators grow, compete, and earn. AI-powered insights, Fame Score rankings, and creator battles with real money on the line.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-wrap gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onChange('feed')}
                  className="btn-primary flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base"
                >
                  Get Started Free <ArrowRight size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onChange('reels')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white/80 font-semibold hover:text-white transition-all hover:bg-white/[.08] bg-white/[.06] border border-white/[.1]"
                >
                  <Play size={16} fill="currentColor" /> Watch Demo
                </motion.button>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="glass rounded-xl p-3.5"
                  >
                    <div className="font-black text-xl mb-0.5 font-display" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-white/40 text-xs">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right: Phone + floating cards */}
          <div className="flex justify-center items-center relative min-h-[560px]">
            <div className="float"><PhoneMockup /></div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="float2 hidden lg:block absolute top-8 -left-8 glass rounded-2xl p-3.5"
              style={{ boxShadow: '0 8px 40px rgba(16,185,129,.15)' }}
            >
              <div className="flex items-center gap-2.5">
                <Flame size={15} className="text-orange-400" />
                <div>
                  <div className="text-white text-xs font-semibold">Viral Predictor</div>
                  <div className="text-[11px] text-emerald-400">87% chance today</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="float3 hidden lg:block absolute top-28 -right-10 glass rounded-2xl p-3"
            >
              <div className="flex items-center gap-3">
                <FameRing score={9.4} size={52} sw={4} />
                <div>
                  <div className="text-white text-xs font-semibold">Fame Score</div>
                  <div className="text-[11px] text-purple-300">Top 1% creator</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="float hidden lg:block absolute bottom-36 -left-10 glass rounded-2xl p-3.5"
              style={{ animationDelay: '3s' }}
            >
              <div className="text-white/45 text-[11px] mb-1">New Follower</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-500" />
                <span className="text-white text-xs font-medium">@techzach followed you</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="float2 hidden lg:block absolute bottom-48 -right-8 glass rounded-2xl p-3.5"
              style={{ animationDelay: '1.5s' }}
            >
              <div className="text-[11px] text-white/45 mb-1">🏆 Battle Won!</div>
              <div className="text-sm font-bold text-amber-400">+$2,400 earned</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-14 pb-24">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-black mb-3 font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                <span className="text-gradient">Built for creators who play to win</span>
              </h2>
              <p className="text-white/50 text-lg">Everything you need to grow faster, earn more, and go viral.</p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => {
              const Icon = iconMap[f.icon] || Brain;
              return (
                <StaggerItem key={f.title}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="glass rounded-2xl p-6 cursor-pointer"
                    style={{ borderTop: `1px solid ${f.color}30` }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${f.color}18`, border: `1px solid ${f.color}35` }}
                    >
                      <Icon size={21} style={{ color: f.color }} />
                    </div>
                    <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                    <div className="flex items-center gap-1 mt-4 text-xs font-semibold" style={{ color: f.color }}>
                      Learn more <ChevronRight size={12} />
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
