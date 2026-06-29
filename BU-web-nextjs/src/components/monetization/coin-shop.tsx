'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Sparkles,
  Zap,
  Star,
  Crown,
  Diamond,
  ShoppingCart,
  Gift,
  Percent,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinPackage {
  coins: number;
  price: number;
  popular?: boolean;
  bonus?: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  glow: string;
}

const packages: CoinPackage[] = [
  {
    coins: 100,
    price: 0.99,
    icon: Sparkles,
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    glow: 'from-blue-500/20',
  },
  {
    coins: 500,
    price: 4.99,
    bonus: 10,
    icon: Zap,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    glow: 'from-emerald-500/20',
  },
  {
    coins: 1000,
    price: 8.99,
    popular: true,
    bonus: 25,
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    glow: 'from-amber-500/20',
  },
  {
    coins: 5000,
    price: 39.99,
    bonus: 50,
    icon: Crown,
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    glow: 'from-violet-500/20',
  },
  {
    coins: 10000,
    price: 74.99,
    bonus: 100,
    icon: Diamond,
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    glow: 'from-rose-500/20',
  },
];

export default function CoinShop() {
  const [selected, setSelected] = useState<number | null>(3);

  return (
    <div className="space-y-6">
      {/* Special Offers Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 animate-shimmer bg-[length:200%_100%]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Gift className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Percent className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">
                Special Offer
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Get 20% bonus coins on your first purchase! Use code{' '}
              <span className="text-amber-400 font-semibold">WELCOME20</span>
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors shrink-0">
            Claim Now
          </button>
        </div>
      </motion.div>

      {/* Boost Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 relative overflow-hidden border-rose-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-rose-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Zap className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-semibold text-foreground">
                Limited Time Boost
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Double coins on all purchases over $20! Offer ends in{' '}
              <span className="text-rose-400 font-semibold">23h 45m</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Coin Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {packages.map((pkg, index) => {
          const isSelected = selected === index;
          const Icon = pkg.icon;

          return (
            <motion.button
              key={pkg.coins}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => setSelected(index)}
              className={cn(
                'relative glass-card p-5 text-center transition-all duration-200',
                isSelected && 'ring-2 ring-primary-500 scale-[1.02]',
                'hover:scale-[1.02]',
              )}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    POPULAR
                  </div>
                </div>
              )}

              {/* Bonus Badge */}
              {pkg.bonus && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400">
                    +{pkg.bonus}%
                  </div>
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3',
                  pkg.bg,
                )}
              >
                <Icon className={cn('w-7 h-7', pkg.color)} />
              </div>

              {/* Coin Count */}
              <div className="text-2xl font-bold text-foreground mb-1">
                {pkg.coins.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                <Coins className="w-3 h-3" />
                coins
              </div>

              {/* Price */}
              <div className="text-lg font-bold text-foreground">
                ${pkg.price.toFixed(2)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {(
                  pkg.price / pkg.coins
                ).toFixed(4)}{' '}
                ¢/coin
              </div>

              {/* Buy Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Buying', pkg.coins, 'coins');
                }}
                className={cn(
                  'w-full mt-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  isSelected
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-primary-500/15 text-primary-400 hover:bg-primary-500/25',
                )}
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </button>
            </motion.button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center">
        <p className="text-[10px] text-muted-foreground">
          All purchases are non-refundable. Coins have no real-world value and
          can only be used within FameWars.
        </p>
      </div>
    </div>
  );
}
