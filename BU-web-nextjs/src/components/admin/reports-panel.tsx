'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag,
  AlertTriangle,
  UserX,
  Ban,
  MessageSquare,
  Shield,
  CheckCheck,
  Clock,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportStatus = 'pending' | 'dismissed' | 'resolved';
type ReportReason =
  | 'harassment'
  | 'spam'
  | 'nudity'
  | 'hate_speech'
  | 'violence'
  | 'copyright'
  | 'other';

interface Report {
  id: string;
  reporter: { username: string; avatar: string | null };
  reportedUser: { username: string; avatar: string | null };
  reason: ReportReason;
  postPreview: string;
  timestamp: string;
  status: ReportStatus;
}

const REASON_LABELS: Record<ReportReason, string> = {
  harassment: 'Harassment',
  spam: 'Spam',
  nudity: 'Nudity / Sexual Content',
  hate_speech: 'Hate Speech',
  violence: 'Violence',
  copyright: 'Copyright Infringement',
  other: 'Other',
};

const REASON_COLORS: Record<ReportReason, string> = {
  harassment: 'text-orange-400 bg-orange-500/10',
  spam: 'text-blue-400 bg-blue-500/10',
  nudity: 'text-rose-400 bg-rose-500/10',
  hate_speech: 'text-red-400 bg-red-500/10',
  violence: 'text-purple-400 bg-purple-500/10',
  copyright: 'text-yellow-400 bg-yellow-500/10',
  other: 'text-muted-foreground bg-glass-light',
};

const mockReports: Report[] = Array.from({ length: 20 }, (_, i) => {
  const reasons: ReportReason[] = [
    'harassment',
    'spam',
    'nudity',
    'hate_speech',
    'violence',
    'copyright',
    'other',
  ];
  const statuses: ReportStatus[] = ['pending', 'dismissed', 'resolved'];
  return {
    id: `report-${i + 1}`,
    reporter: {
      username: `reporter_${i + 1}`,
      avatar: null,
    },
    reportedUser: {
      username: `reported_${i + 1}`,
      avatar: null,
    },
    reason: reasons[i % reasons.length],
    postPreview:
      'This is a sample post that was flagged for review by our moderation system...',
    timestamp: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    status: statuses[i % 3],
  };
});

const STATUS_TABS: { label: string; value: ReportStatus | 'ALL' }[] = [
  { label: 'All Reports', value: 'ALL' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Dismissed', value: 'dismissed' },
];

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ReportsPanel() {
  const [statusTab, setStatusTab] = useState<ReportStatus | 'ALL'>('ALL');
  const [reports, setReports] = useState(mockReports);

  const filtered = useMemo(
    () =>
      statusTab === 'ALL'
        ? reports
        : reports.filter((r) => r.status === statusTab),
    [reports, statusTab],
  );

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  function updateStatus(id: string, status: ReportStatus) {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}

      {/* Status Tabs */}
      <div className="flex items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={cn(
              'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              statusTab === tab.value
                ? 'bg-primary-500/15 text-primary-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-glass-light',
            )}
          >
            {tab.label}
            {tab.value === 'pending' && pendingCount > 0 && (
              <span className="ml-2 text-[10px] bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((report) => (
            <motion.div
              key={report.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'glass-card p-4',
                report.status === 'pending' && 'border-rose-500/20',
              )}
            >
              <div className="flex items-start gap-4">
                {/* Reporter / Reported */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {report.reporter.username[0].toUpperCase()}
                      </div>
                      <span className="text-muted-foreground">
                        {report.reporter.username}
                      </span>
                    </div>
                    <Flag className="w-3.5 h-3.5 text-rose-400" />
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {report.reportedUser.username[0].toUpperCase()}
                      </div>
                      <span className="text-foreground font-medium">
                        {report.reportedUser.username}
                      </span>
                    </div>
                  </div>

                  {/* Reason Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        REASON_COLORS[report.reason],
                      )}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {REASON_LABELS[report.reason]}
                    </span>
                    {report.status !== 'pending' && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                          report.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {report.status === 'resolved' ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {report.status}
                      </span>
                    )}
                  </div>

                  {/* Post Preview */}
                  <div className="bg-glass-light rounded-lg p-3 border border-white/5">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {report.postPreview}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(report.timestamp)}
                  </div>
                </div>

                {/* Actions */}
                {report.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Ban Content
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Ban User
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Warn
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'dismissed')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Dismiss
                    </button>
                  </div>
                )}

                {report.status !== 'pending' && (
                  <div className="shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold',
                        report.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {report.status === 'resolved' ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {report.status.charAt(0).toUpperCase() +
                        report.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No reports found.
          </div>
        )}
      </div>
    </div>
  );
}
