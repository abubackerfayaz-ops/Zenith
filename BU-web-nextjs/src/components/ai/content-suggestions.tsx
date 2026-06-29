'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  TrendingUp,
  Hash,
  Clock,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  ChevronRight,
  RefreshCw,
  ThumbsUp,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  predictedEngagement: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface TrendingTopic {
  id: string;
  name: string;
  postCount: number;
  category: string;
  isRising?: boolean;
}

interface HashtagRecommendation {
  tag: string;
  postCount: number;
  engagementRate: number;
  relevance: number;
}

interface BestPostingTime {
  day: string;
  time: string;
  score: number;
}

interface ContentSuggestionsProps {
  ideas: ContentIdea[];
  trendingTopics: TrendingTopic[];
  hashtags: HashtagRecommendation[];
  bestTimes: BestPostingTime[];
  onUseIdea?: (idea: ContentIdea) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-green-500', bg: 'bg-green-500/10' },
  medium: { label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  hard: { label: 'Hard', color: 'text-red-500', bg: 'bg-red-500/10' },
};

export function ContentSuggestions({
  ideas,
  trendingTopics,
  hashtags,
  bestTimes,
  onUseIdea,
  onRefresh,
  isLoading = false,
  className,
}: ContentSuggestionsProps) {
  const [activeTab, setActiveTab] = useState('ideas');

  const tabs = [
    { id: 'ideas', label: 'Ideas', icon: <Lightbulb size={14} /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={14} /> },
    { id: 'hashtags', label: 'Hashtags', icon: <Hash size={14} /> },
    { id: 'timing', label: 'Best Time', icon: <Clock size={14} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card rounded-2xl border border-white/10 p-5',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20">
            <Sparkles size={16} className="text-primary-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Content Suggestions</h3>
            <p className="text-[10px] text-muted-foreground">AI-powered recommendations</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="glass"
        className="mb-4"
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'ideas' && (
          <motion.div
            key="ideas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2.5"
          >
            {ideas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No suggestions yet</p>
            ) : (
              ideas.map((idea, i) => {
                const diff = difficultyConfig[idea.difficulty];
                return (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => onUseIdea?.(idea)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">{idea.title}</span>
                          <Badge variant={idea.difficulty === 'easy' ? 'success' : idea.difficulty === 'medium' ? 'warning' : 'danger'} className="text-[8px] px-1 py-0">
                            {diff.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{idea.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Heart size={10} className="text-red-500" />
                            {formatNumber(idea.predictedEngagement)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{idea.category}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'trending' && (
          <motion.div
            key="trending"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {trendingTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No trending topics</p>
            ) : (
              trendingTopics.map((topic, i) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-glass-light transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">#{topic.name}</span>
                      {topic.isRising && (
                        <TrendingUp size={10} className="text-green-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatNumber(topic.postCount)} posts · {topic.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {topic.isRising && (
                      <Badge variant="success" className="text-[8px] px-1 py-0">Rising</Badge>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'hashtags' && (
          <motion.div
            key="hashtags"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {hashtags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No hashtag suggestions</p>
            ) : (
              hashtags.map((ht, i) => (
                <motion.div
                  key={ht.tag}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-glass-light transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-primary-500/10">
                    <Hash size={14} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">#{ht.tag}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{formatNumber(ht.postCount)} posts</span>
                      <span>·</span>
                      <span>{ht.engagementRate}% eng.</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'text-xs font-semibold tabular-nums',
                      ht.relevance >= 80 ? 'text-green-500' : ht.relevance >= 50 ? 'text-amber-500' : 'text-muted-foreground',
                    )}
                  >
                    {Math.round(ht.relevance)}%
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'timing' && (
          <motion.div
            key="timing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {bestTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No timing data</p>
            ) : (
              bestTimes.map((bt, i) => (
                <motion.div
                  key={`${bt.day}-${bt.time}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                >
                  <div className="p-1.5 rounded-lg bg-accent-500/10">
                    <Clock size={14} className="text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{bt.day}</span>
                      <span className="text-sm font-bold text-primary-500">{bt.time}</span>
                    </div>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${bt.score}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-foreground tabular-nums">
                          {Math.round(bt.score)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {i === 0 && (
                    <div className="p-1 rounded-full bg-amber-500/20 text-amber-500">
                      <ThumbsUp size={12} />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Action */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <Button variant="primary" size="sm" fullWidth onClick={onRefresh} isLoading={isLoading}>
          <RefreshCw size={14} />
          Generate New Ideas
        </Button>
      </div>
    </motion.div>
  );
}
