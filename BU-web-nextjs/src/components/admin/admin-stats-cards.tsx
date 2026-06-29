'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  DollarSign,
  Flag,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCard {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  trend: { value: number; positive: boolean };
  color: string;
}

const stats: StatCard[] = [
  {
    label: 'Total Users',
    value: 28450,
    icon: Users,
    trend: { value: 12.5, positive: true },
    color: 'from-blue-500/20 to-blue-600/10',
  },
  {
    label: 'Active Users',
    value: 12380,
    icon: UserCheck,
    trend: { value: 8.2, positive: true },
    color: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    label: 'Total Revenue',
    value: 84720,
    prefix: '$',
    icon: DollarSign,
    trend: { value: 15.3, positive: true },
    color: 'from-amber-500/20 to-amber-600/10',
  },
  {
    label: 'Reports Pending',
    value: 47,
    icon: Flag,
    trend: { value: 5.1, positive: false },
    color: 'from-rose-500/20 to-rose-600/10',
  },
  {
    label: 'Total Posts',
    value: 15630,
    icon: FileText,
    trend: { value: 3.7, positive: true },
    color: 'from-violet-500/20 to-violet-600/10',
  },
];

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
  const ref = useRef<HTMLSpanElement>(null);
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
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function AdminStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className={cn(
            'glass-card p-5 relative overflow-hidden group',
          )}
        >
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              stat.color,
            )}
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-glass-heavy flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                  stat.trend.positive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400',
                )}
              >
                {stat.trend.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.trend.value}%
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-0.5">
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
