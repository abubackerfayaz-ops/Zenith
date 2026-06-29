'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Gift,
  Swords,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

type Period = '7d' | '30d' | '90d';

const revenueChartData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 5000) + 500,
}));

const breakdownData = [
  { name: 'Subscriptions', value: 45, color: '#0ea5e9' },
  { name: 'Tips', value: 25, color: '#a855f7' },
  { name: 'Ad Revenue', value: 18, color: '#10b981' },
  { name: 'Battle Rewards', value: 12, color: '#f59e0b' },
];

const recentTransactions = [
  {
    type: 'subscription',
    user: 'john_doe',
    amount: 9.99,
    date: '2 hours ago',
    status: 'completed',
  },
  {
    type: 'tip',
    user: 'sarah_smith',
    amount: 5.0,
    date: '5 hours ago',
    status: 'completed',
  },
  {
    type: 'battle',
    user: 'gamer_pro',
    amount: 25.0,
    date: '1 day ago',
    status: 'completed',
  },
  {
    type: 'subscription',
    user: 'alex_wong',
    amount: 19.99,
    date: '2 days ago',
    status: 'pending',
  },
  {
    type: 'tip',
    user: 'emma_jones',
    amount: 2.5,
    date: '2 days ago',
    status: 'completed',
  },
];

const payoutMethods = [
  { name: 'PayPal', email: 'creator@email.com', active: true },
  { name: 'Bank Transfer', email: '****1234', active: false },
];

const TYPE_STYLES: Record<string, string> = {
  subscription: 'bg-primary-500/15 text-primary-400',
  tip: 'bg-accent-500/15 text-accent-400',
  battle: 'bg-amber-500/15 text-amber-400',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="glass-heavy rounded-lg p-3 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function RevenueDashboard() {
  const [period, setPeriod] = useState<Period>('30d');

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Revenue</h2>
        <div className="flex items-center glass border border-white/10 rounded-lg p-0.5">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                period === p
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Revenue Overview
          </h3>
          <div className="text-2xl font-bold text-foreground">
            $12,480<span className="text-xs text-muted-foreground font-normal ml-1">this period</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Breakdown & Payout Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Revenue Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {breakdownData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload ? (
                      <div className="glass-heavy rounded-lg p-2 text-xs shadow-xl">
                        <p style={{ color: payload[0].color }}>
                          {payload[0].name}: {payload[0].value}%
                        </p>
                      </div>
                    ) : null
                  }
                />
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

        {/* Payout Methods */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Payout Methods
            </h3>
            <button className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
              <Plus className="w-3 h-3" />
              Add Method
            </button>
          </div>
          <div className="space-y-3">
            {payoutMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-between p-3 rounded-lg bg-glass-light"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-500/15 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {method.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {method.email}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                    method.active
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {method.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Transactions
          </h3>
          <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                  Type
                </th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                  User
                </th>
                <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">
                  Amount
                </th>
                <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">
                  Date
                </th>
                <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-glass-light transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        TYPE_STYLES[tx.type],
                      )}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{tx.user}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-emerald-400">
                    +${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {tx.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        tx.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400',
                      )}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
