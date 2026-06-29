'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Shield,
  Trash2,
  Flag,
  Image,
  Video,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ContentType = 'post' | 'reel' | 'comment';
type FlagReason =
  | 'hate_speech'
  | 'harassment'
  | 'spam'
  | 'nudity'
  | 'violence'
  | 'misinformation'
  | 'copyright';

interface FlaggedContent {
  id: string;
  type: ContentType;
  author: { username: string; avatar: string | null };
  content: string;
  flagReason: FlagReason;
  flags: number;
  timestamp: string;
  status: 'pending' | 'approved' | 'removed';
}

const FLAG_REASON_LABELS: Record<FlagReason, string> = {
  hate_speech: 'Hate Speech',
  harassment: 'Harassment',
  spam: 'Spam',
  nudity: 'Nudity',
  violence: 'Violence',
  misinformation: 'Misinformation',
  copyright: 'Copyright',
};

const FLAG_REASON_COLORS: Record<FlagReason, string> = {
  hate_speech: 'bg-red-500/10 text-red-400',
  harassment: 'bg-orange-500/10 text-orange-400',
  spam: 'bg-blue-500/10 text-blue-400',
  nudity: 'bg-rose-500/10 text-rose-400',
  violence: 'bg-purple-500/10 text-purple-400',
  misinformation: 'bg-yellow-500/10 text-yellow-400',
  copyright: 'bg-cyan-500/10 text-cyan-400',
};

const TYPE_ICONS: Record<ContentType, React.ElementType> = {
  post: Image,
  reel: Video,
  comment: MessageSquare,
};

const TYPE_LABELS: Record<ContentType, string> = {
  post: 'Post',
  reel: 'Reel',
  comment: 'Comment',
};

const mockContent: FlaggedContent[] = Array.from({ length: 24 }, (_, i) => {
  const types: ContentType[] = ['post', 'reel', 'comment'];
  const reasons: FlagReason[] = [
    'hate_speech',
    'harassment',
    'spam',
    'nudity',
    'violence',
    'misinformation',
    'copyright',
  ];
  return {
    id: `flagged-${i + 1}`,
    type: types[i % 3],
    author: {
      username: `user_${Math.floor(Math.random() * 1000)}`,
      avatar: null,
    },
    content:
      'This is the content that was flagged for review by the moderation system because it may violate community guidelines...',
    flagReason: reasons[i % reasons.length],
    flags: Math.floor(Math.random() * 50) + 1,
    timestamp: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    status: 'pending',
  };
});

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ITEMS_PER_PAGE = 6;

export default function ContentModeration() {
  const [items, setItems] = useState(mockContent);
  const [typeFilter, setTypeFilter] = useState<ContentType | 'ALL'>('ALL');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = items;
    if (typeFilter !== 'ALL') list = list.filter((i) => i.type === typeFilter);
    return list;
  }, [items, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  function updateStatus(id: string, status: 'approved' | 'removed') {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i)),
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Queue Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Content Moderation
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Clock className="w-3 h-3" />
            {pendingCount} pending
          </span>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        {(
          [
            { label: 'All', value: 'ALL' },
            { label: 'Posts', value: 'post' },
            { label: 'Reels', value: 'reel' },
            { label: 'Comments', value: 'comment' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setTypeFilter(tab.value);
              setPage(0);
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              typeFilter === tab.value
                ? 'bg-primary-500/15 text-primary-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-glass-light',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {paginated.map((item) => {
            const TypeIcon = TYPE_ICONS[item.type];
            const isPending = item.status === 'pending';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  'glass-card p-4',
                  isPending && 'border-rose-500/20',
                  item.status === 'removed' && 'opacity-60',
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Type Badge */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                      item.type === 'post'
                        ? 'bg-blue-500/15 text-blue-400'
                        : item.type === 'reel'
                          ? 'bg-purple-500/15 text-purple-400'
                          : 'bg-emerald-500/15 text-emerald-400',
                    )}
                  >
                    <TypeIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Author & Type */}
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-[8px] font-bold">
                        {item.author.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">
                        {item.author.username}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {TYPE_LABELS[item.type]}
                      </span>
                    </div>

                    {/* Flag Reason */}
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        FLAG_REASON_COLORS[item.flagReason],
                      )}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {FLAG_REASON_LABELS[item.flagReason]}
                    </span>

                    {/* Flag Count */}
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      {item.flags} flags
                    </span>
                  </div>

                  {/* Status */}
                  {!isPending && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        item.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400',
                      )}
                    >
                      {item.status === 'approved' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {item.status}
                    </span>
                  )}
                </div>

                {/* Content Preview */}
                <div className="bg-glass-light rounded-lg p-3 mb-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                </div>

                {/* Timestamp & Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimeAgo(item.timestamp)}
                  </span>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStatus(item.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, 'removed')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-glass-light text-muted-foreground hover:text-foreground transition-colors">
                        <Flag className="w-3.5 h-3.5" />
                        Report
                      </button>
                    </div>
                  )}

                  {!isPending && (
                    <span className="text-[10px] text-muted-foreground">
                      {item.status === 'approved'
                        ? 'Content approved'
                        : 'Content removed'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-light disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                page === i
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-glass-light',
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-light disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground text-sm">
          No flagged content to review.
        </div>
      )}
    </div>
  );
}
