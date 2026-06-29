'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Plus,
  X,
  Users,
  DollarSign,
  Power,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tier {
  id: string;
  name: string;
  price: number;
  description: string;
  perks: string[];
  subscriberCount: number;
  totalRevenue: number;
  active: boolean;
}

const initialTiers: Tier[] = [
  {
    id: 'tier-1',
    name: 'Supporter',
    price: 4.99,
    description: 'Support the creator and get exclusive perks',
    perks: ['Exclusive badge', 'Priority comments', 'Member-only posts'],
    subscriberCount: 234,
    totalRevenue: 11676,
    active: true,
  },
  {
    id: 'tier-2',
    name: 'VIP',
    price: 9.99,
    description: 'VIP access with premium content',
    perks: [
      'All Supporter perks',
      'Exclusive content',
      'Behind the scenes',
      'Personalized shoutout',
    ],
    subscriberCount: 89,
    totalRevenue: 8891,
    active: true,
  },
  {
    id: 'tier-3',
    name: 'Legend',
    price: 24.99,
    description: 'The ultimate fan experience',
    perks: [
      'All VIP perks',
      'Private discord role',
      'Monthly 1-on-1 chat',
      'Early access to content',
      'Custom emoji pack',
    ],
    subscriberCount: 32,
    totalRevenue: 7996,
    active: false,
  },
];

export default function SubscriptionManager() {
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [newPerk, setNewPerk] = useState('');

  function toggleTier(id: string) {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
    );
  }

  function addPerk(tierId: string) {
    if (!newPerk.trim()) return;
    setTiers((prev) =>
      prev.map((t) =>
        t.id === tierId
          ? { ...t, perks: [...t.perks, newPerk.trim()] }
          : t,
      ),
    );
    setNewPerk('');
  }

  function removePerk(tierId: string, index: number) {
    setTiers((prev) =>
      prev.map((t) =>
        t.id === tierId
          ? { ...t, perks: t.perks.filter((_, i) => i !== index) }
          : t,
      ),
    );
  }

  function updateTier(id: string, field: keyof Tier, value: any) {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Subscription Tiers
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 transition-colors">
          <Plus className="w-4 h-4" />
          Add Tier
        </button>
      </div>

      {/* Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isEditing = editingTier === tier.id;

          return (
            <motion.div
              key={tier.id}
              layout
              className={cn(
                'glass-card p-6 relative overflow-hidden',
                !tier.active && 'opacity-60',
              )}
            >
              {/* Glow effect for active */}
              {tier.active && (
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        tier.active
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-glass-heavy text-muted-foreground',
                      )}
                    >
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) =>
                            updateTier(tier.id, 'name', e.target.value)
                          }
                          className="glass-input text-sm font-semibold w-28"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            {tier.name}
                          </h3>
                          {tier === tiers[0] && (
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        {isEditing ? (
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground">
                              $
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={tier.price}
                              onChange={(e) =>
                                updateTier(
                                  tier.id,
                                  'price',
                                  parseFloat(e.target.value),
                                )
                              }
                              className="glass-input text-sm font-bold w-16 ml-1"
                            />
                            <span className="text-xs text-muted-foreground ml-1">
                              /month
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-foreground">
                            ${tier.price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-1">
                          / month
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTier(tier.id)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      tier.active
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-glass-light text-muted-foreground',
                    )}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                {isEditing ? (
                  <textarea
                    value={tier.description}
                    onChange={(e) =>
                      updateTier(tier.id, 'description', e.target.value)
                    }
                    className="glass-input w-full text-xs mb-4 resize-none h-16"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground mb-4">
                    {tier.description}
                  </p>
                )}

                {/* Perks */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Perks
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => setEditingTier(null)}
                        className="text-xs text-primary-400 hover:text-primary-300"
                      >
                        Done
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {tier.perks.map((perk, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-foreground"
                      >
                        {isEditing ? (
                          <>
                            <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                            <span className="flex-1">{perk}</span>
                            <button
                              onClick={() => removePerk(tier.id, i)}
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                            {perk}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newPerk}
                        onChange={(e) => setNewPerk(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addPerk(tier.id);
                        }}
                        className="glass-input flex-1 text-xs"
                        placeholder="Add a perk..."
                      />
                      <button
                        onClick={() => addPerk(tier.id)}
                        className="p-1.5 rounded-lg bg-primary-500/15 text-primary-400 hover:bg-primary-500/25"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                      <Users className="w-3 h-3" />
                      Subscribers
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {tier.subscriberCount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                      <DollarSign className="w-3 h-3" />
                      Revenue
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">
                      ${tier.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <button
                    onClick={() => setEditingTier(tier.id)}
                    className="w-full mt-3 py-2 rounded-lg text-xs font-medium bg-glass-light text-muted-foreground hover:text-foreground hover:bg-glass-heavy transition-colors"
                  >
                    Edit Tier
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Card */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Preview
        </h3>
        <div className="max-w-sm mx-auto">
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-3">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-bold text-foreground mb-1">
              {tiers[0]?.name || 'Supporter'}
            </h4>
            <div className="text-2xl font-bold text-foreground mb-2">
              ${tiers[0]?.price.toFixed(2) || '4.99'}
              <span className="text-sm text-muted-foreground font-normal">
                /month
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {tiers[0]?.description || 'Support and get perks'}
            </p>
            <div className="space-y-2 mb-4">
              {(tiers[0]?.perks || []).map((perk, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {perk}
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
