'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Coins,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  History,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletData {
  coinBalance: number;
  totalRevenue: number;
  pendingRevenue: number;
  totalWithdrawn: number;
}

const mockWallet: WalletData = {
  coinBalance: 12580,
  totalRevenue: 28450,
  pendingRevenue: 3200,
  totalWithdrawn: 19200,
};

function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.5,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = 0;
    const end = value;
    const startTime = performance.now();

    function animate(timestamp: number) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function WalletCard() {
  const [wallet] = useState<WalletData>(mockWallet);

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">
                  Coin Balance
                </div>
                <div className="text-3xl font-bold text-foreground">
                  <AnimatedCounter value={wallet.coinBalance} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 transition-colors">
              <Plus className="w-4 h-4" />
              Deposit
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors">
              <Minus className="w-4 h-4" />
              Withdraw
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-glass-light text-muted-foreground hover:text-foreground hover:bg-glass-heavy transition-colors">
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: wallet.totalRevenue,
            prefix: '$',
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/15',
          },
          {
            label: 'Pending Revenue',
            value: wallet.pendingRevenue,
            prefix: '$',
            icon: Clock,
            color: 'text-amber-400',
            bg: 'bg-amber-500/15',
          },
          {
            label: 'Total Withdrawn',
            value: wallet.totalWithdrawn,
            prefix: '$',
            icon: CreditCard,
            color: 'text-blue-400',
            bg: 'bg-blue-500/15',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className={cn('text-xl font-bold text-foreground', stat.color)}>
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                duration={1.2}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Transactions
          </h3>
          <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-2">
          {[
            {
              type: 'deposit' as const,
              label: 'Coin Purchase',
              amount: '+500',
              date: '2 hours ago',
            },
            {
              type: 'revenue' as const,
              label: 'Battle Reward',
              amount: '+$12.50',
              date: '5 hours ago',
            },
            {
              type: 'withdrawal' as const,
              label: 'Withdraw to PayPal',
              amount: '-$50.00',
              date: '1 day ago',
            },
            {
              type: 'revenue' as const,
              label: 'Subscription Payment',
              amount: '+$9.99',
              date: '2 days ago',
            },
          ].map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    tx.type === 'deposit'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : tx.type === 'revenue'
                        ? 'bg-primary-500/15 text-primary-400'
                        : 'bg-rose-500/15 text-rose-400',
                  )}
                >
                  {tx.type === 'deposit' || tx.type === 'revenue' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {tx.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {tx.date}
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  tx.amount.startsWith('+')
                    ? 'text-emerald-400'
                    : 'text-rose-400',
                )}
              >
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
