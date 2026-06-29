'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Globe,
  Smartphone,
  Monitor,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

type DateRange = '7d' | '30d' | '90d';

const userGrowthData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  users: Math.floor(Math.random() * 500) + 100,
}));

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 10000) + 1000,
}));

const contentTypesData = [
  { name: 'Posts', value: 45 },
  { name: 'Reels', value: 30 },
  { name: 'Comments', value: 15 },
  { name: 'Stories', value: 10 },
];

const topCountriesData = [
  { name: 'United States', value: 35 },
  { name: 'United Kingdom', value: 18 },
  { name: 'Germany', value: 12 },
  { name: 'Canada', value: 10 },
  { name: 'Australia', value: 8 },
  { name: 'Other', value: 17 },
];

const userRolesData = [
  { name: 'Users', value: 65 },
  { name: 'Creators', value: 25 },
  { name: 'Admins', value: 10 },
];

const deviceTypesData = [
  { name: 'iOS', value: 45 },
  { name: 'Android', value: 35 },
  { name: 'Desktop', value: 15 },
  { name: 'Tablet', value: 5 },
];

const PIE_COLORS = ['#0ea5e9', '#a855f7', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

const statCards = [
  {
    label: 'Total Users',
    value: '28,450',
    change: '+12.5%',
    positive: true,
    icon: Users,
  },
  {
    label: 'Active Users',
    value: '12,380',
    change: '+8.2%',
    positive: true,
    icon: Users,
  },
  {
    label: 'Revenue (MTD)',
    value: '$84,720',
    change: '+15.3%',
    positive: true,
    icon: DollarSign,
  },
  {
    label: 'Total Content',
    value: '15,630',
    change: '+3.7%',
    positive: true,
    icon: FileText,
  },
  {
    label: 'Avg Session',
    value: '8m 42s',
    change: '-2.1%',
    positive: false,
    icon: Smartphone,
  },
  {
    label: 'Bounce Rate',
    value: '32.1%',
    change: '-4.5%',
    positive: true,
    icon: Monitor,
  },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="glass-heavy rounded-lg p-3 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload) return null;
  const data = payload[0];
  return (
    <div className="glass-heavy rounded-lg p-3 text-xs shadow-xl">
      <p style={{ color: data.color }} className="font-medium">
        {data.name}: {data.value}%
      </p>
    </div>
  );
}

export default function PlatformAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <div className="flex items-center glass border border-white/10 rounded-lg p-0.5">
            {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  dateRange === range
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Download Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-glass-heavy flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span
                className={cn(
                  'flex items-center gap-0.5 text-[10px] font-medium',
                  stat.positive ? 'text-emerald-400' : 'text-rose-400',
                )}
              >
                {stat.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              User Growth
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {dateRange}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#userGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Revenue</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {dateRange}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Types */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Content Types
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentTypesData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  type="number"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {contentTypesData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Countries */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Top Countries
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCountriesData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  type="number"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {topCountriesData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Roles */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            User Roles
          </h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRolesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {userRolesData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      fillOpacity={0.8}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Types */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Device Types
          </h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deviceTypesData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      fillOpacity={0.8}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
