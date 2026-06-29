'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Zap,
  Lightbulb,
  Hash,
  Clock,
  Sparkles,
  ArrowUp,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';

interface ViralPrediction {
  predictedLikes: number;
  predictedComments: number;
  predictedShares: number;
  predictedFollowerGrowth: number;
  viralProbability: number;
  suggestions: Suggestion[];
}

interface Suggestion {
  id: string;
  type: 'caption' | 'hashtag' | 'timing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action?: string;
}

interface ViralPredictorProps {
  prediction: ViralPrediction;
  isLoading?: boolean;
  className?: string;
}

const impactConfig = {
  high: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'High Impact' },
  medium: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Medium Impact' },
  low: { color: 'text-muted-foreground', bg: 'bg-glass-light', label: 'Low Impact' },
};

export function ViralPredictor({
  prediction,
  isLoading = false,
  className,
}: ViralPredictorProps) {
  const [animatedProbability, setAnimatedProbability] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProbability(prediction.viralProbability);
    }, 300);
    return () => clearTimeout(timer);
  }, [prediction.viralProbability]);

  if (isLoading) {
    return (
      <div className={cn('glass-card rounded-2xl border border-white/10 p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-1/3 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden glass-card rounded-2xl border border-white/10 p-6',
        className,
      )}
    >
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-accent-500/15 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20">
              <Sparkles size={18} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Viral Predictor</h3>
              <p className="text-[10px] text-muted-foreground">AI-powered analysis</p>
            </div>
          </div>
          <Badge variant="premium" icon={<Zap size={10} />}>
            AI
          </Badge>
        </div>

        {/* Viral Probability Circular Meter */}
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width="88" height="88" className="-rotate-90">
              <circle
                cx="44"
                cy="44"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6"
              />
              <motion.circle
                cx="44"
                cy="44"
                r="36"
                fill="none"
                stroke="url(#viral-gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={36 * 2 * Math.PI}
                strokeDashoffset={36 * 2 * Math.PI * (1 - animatedProbability / 100)}
                initial={false}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="viral-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="text-xl font-black text-foreground tabular-nums"
              >
                {Math.round(animatedProbability)}%
              </motion.span>
              <span className="text-[8px] text-muted-foreground mt-0.5">Viral</span>
            </div>
          </div>

          {/* Predicted Stats */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="text-center p-2 rounded-xl bg-white/5">
              <Heart size={14} className="text-red-500 mx-auto mb-0.5" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-foreground block tabular-nums"
              >
                {formatNumber(prediction.predictedLikes)}
              </motion.span>
              <span className="text-[9px] text-muted-foreground">Likes</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <MessageCircle size={14} className="text-primary-500 mx-auto mb-0.5" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-foreground block tabular-nums"
              >
                {formatNumber(prediction.predictedComments)}
              </motion.span>
              <span className="text-[9px] text-muted-foreground">Comments</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <Share2 size={14} className="text-accent-500 mx-auto mb-0.5" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-foreground block tabular-nums"
              >
                {formatNumber(prediction.predictedShares)}
              </motion.span>
              <span className="text-[9px] text-muted-foreground">Shares</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <Users size={14} className="text-amber-500 mx-auto mb-0.5" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-foreground block tabular-nums"
              >
                +{formatNumber(prediction.predictedFollowerGrowth)}
              </motion.span>
              <span className="text-[9px] text-muted-foreground">Followers</span>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Lightbulb size={14} className="text-amber-500" />
            <h4 className="text-xs font-semibold text-foreground">Suggestions to Improve</h4>
          </div>

          {prediction.suggestions.map((suggestion, i) => {
            const impact = impactConfig[suggestion.impact];
            const icons = {
              caption: Sparkles,
              hashtag: Hash,
              timing: Clock,
            };
            const Icon = icons[suggestion.type];

            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className={cn('p-1.5 rounded-lg', impact.bg)}>
                  <Icon size={14} className={impact.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {suggestion.title}
                    </span>
                    <Badge variant={suggestion.impact === 'high' ? 'success' : suggestion.impact === 'medium' ? 'warning' : 'default'} className="text-[8px] px-1 py-0">
                      {impact.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {suggestion.description}
                  </p>
                </div>
                <ArrowUp size={14} className={cn('shrink-0', impact.color)} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
