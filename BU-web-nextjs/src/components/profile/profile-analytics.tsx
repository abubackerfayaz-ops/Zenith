'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn, formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Period = '7d' | '30d' | '90d';

const PERIODS: { id: Period; label: string }[] = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
];

const MOCK_FOLLOWER_GROWTH = [
  { date: 'Mon', followers: 1200 },
  { date: 'Tue', followers: 1350 },
  { date: 'Wed', followers: 1420 },
  { date: 'Thu', followers: 1580 },
  { date: 'Fri', followers: 1650 },
  { date: 'Sat', followers: 1800 },
  { date: 'Sun', followers: 2100 },
];

const MOCK_ENGAGEMENT = [
  { date: 'Week 1', rate: 4.2 },
  { date: 'Week 2', rate: 4.8 },
  { date: 'Week 3', rate: 5.1 },
  { date: 'Week 4', rate: 6.3 },
];

const MOCK_CONTENT_PERFORMANCE = [
  { type: 'Images', likes: 1200, comments: 80, shares: 45 },
  { type: 'Reels', likes: 3400, comments: 230, shares: 180 },
  { type: 'Stories', likes: 800, comments: 40, shares: 20 },
];

const MOCK_DEMOGRAPHICS = [
  { name: '18-24', value: 35 },
  { name: '25-34', value: 30 },
  { name: '35-44', value: 18 },
  { name: '45-54', value: 10 },
  { name: '55+', value: 7 },
];

const DEMO_COLORS = ['#0ea5e9', '#a855f7', '#f59e0b', '#22c55e', '#ef4444'];

interface ProfileAnalyticsProps {
  followerGrowth?: typeof MOCK_FOLLOWER_GROWTH;
  engagementRate?: typeof MOCK_ENGAGEMENT;
  contentPerformance?: typeof MOCK_CONTENT_PERFORMANCE;
  demographics?: typeof MOCK_DEMOGRAPHICS;
  className?: string;
}

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

function StatCard({ label, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl p-4 bg-white/[0.06] border border-white/10"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('p-1.5 rounded-lg', isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
          {icon}
        </span>
      </div>
      <p className="text-xl font-bold text-foreground tabular-nums">{value}</p>
      <div className={cn('flex items-center gap-0.5 mt-1 text-xs font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? '+' : ''}{change}%
      </div>
    </motion.div>
  );
}

export function ProfileAnalytics({
  followerGrowth = MOCK_FOLLOWER_GROWTH,
  engagementRate = MOCK_ENGAGEMENT,
  contentPerformance = MOCK_CONTENT_PERFORMANCE,
  demographics = MOCK_DEMOGRAPHICS,
  className,
}: ProfileAnalyticsProps) {
  const [period, setPeriod] = useState<Period>('30d');

  const stats = [
    { label: 'Total Views', value: formatNumber(184500), change: 12.5, icon: <Eye size={14} /> },
    { label: 'Total Likes', value: formatNumber(42300), change: 8.3, icon: <Heart size={14} /> },
    { label: 'Comments', value: formatNumber(8900), change: -2.1, icon: <MessageCircle size={14} /> },
    { label: 'Shares', value: formatNumber(5600), change: 15.7, icon: <Share2 size={14} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-500" />
          Analytics
        </h3>
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                period === p.id
                  ? 'bg-primary-500 text-white'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Follower Growth Chart */}
        <Card glass className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary-500" />
              <span className="text-sm font-semibold text-foreground">Follower Growth</span>
            </div>
            <Badge variant="success" icon={<TrendingUp size={10} />}>+12.5%</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={followerGrowth}>
                <defs>
                  <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#followerGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Engagement Rate */}
        <Card glass className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-accent-500" />
              <span className="text-sm font-semibold text-foreground">Engagement Rate</span>
            </div>
            <Badge variant="primary" icon={<TrendingUp size={10} />}>+6.3%</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Content Performance */}
        <Card glass className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Content Performance</span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="type" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="likes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shares" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Audience Demographics */}
        <Card glass className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-green-500" />
              <span className="text-sm font-semibold text-foreground">Age Demographics</span>
            </div>
          </div>
          <div className="flex items-center gap-4 h-48">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {demographics.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DEMO_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {demographics.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: DEMO_COLORS[i] }}
                  />
                  <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                  <span className="text-xs font-semibold text-foreground">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
