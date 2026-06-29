'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Swords,
  Search,
  Trophy,
  Clock,
  Tag,
  FileText,
  AlertCircle,
  Check,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';

interface Opponent {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
  fameScore: number;
}

interface BattleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponents: Opponent[];
  onCreateBattle: (data: BattleFormData) => void;
  isCreating?: boolean;
}

export interface BattleFormData {
  title: string;
  description: string;
  opponentId: string;
  category: string;
  prize: string;
  duration: number;
  rules: string[];
}

const CATEGORIES = [
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'dance', label: 'Dance', icon: '💃' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'fashion', label: 'Fashion', icon: '👕' },
  { id: 'food', label: 'Food', icon: '🍳' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'education', label: 'Education', icon: '📚' },
];

const DURATIONS = [
  { value: 24, label: '24 Hours' },
  { value: 48, label: '48 Hours' },
  { value: 72, label: '3 Days' },
  { value: 168, label: '7 Days' },
];

const RULE_PRESETS = [
  'No hate speech or harassment',
  'Original content only',
  'Follow community guidelines',
  'Respectful voting only',
];

export function BattleCreateModal({
  isOpen,
  onClose,
  opponents,
  onCreateBattle,
  isCreating = false,
}: BattleCreateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [category, setCategory] = useState('');
  const [prize, setPrize] = useState('');
  const [duration, setDuration] = useState(48);
  const [rules, setRules] = useState<string[]>([RULE_PRESETS[0], RULE_PRESETS[2]]);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState(1);
  const [titleError, setTitleError] = useState('');

  const filteredOpponents = useMemo(() => {
    if (!searchQuery) return opponents;
    const q = searchQuery.toLowerCase();
    return opponents.filter(
      (o) => o.name.toLowerCase().includes(q) || o.username.toLowerCase().includes(q),
    );
  }, [opponents, searchQuery]);

  const selectedOpponent = opponents.find((o) => o.id === opponentId);

  const toggleRule = (rule: string) => {
    setRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule],
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError('Battle title is required');
      return;
    }
    if (!opponentId) {
      setTitleError('Select an opponent');
      return;
    }
    if (!category) {
      setTitleError('Select a category');
      return;
    }
    setTitleError('');

    onCreateBattle({
      title: title.trim(),
      description: description.trim(),
      opponentId,
      category,
      prize: prize.trim(),
      duration,
      rules,
    });
  };

  const canContinue = (s: number) => {
    switch (s) {
      case 1: return !!title.trim() && !!opponentId;
      case 2: return !!category;
      default: return true;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Battle"
      size="2xl"
    >
      <div className="space-y-5">
        {/* Steps Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => s < step && setStep(s)}
                className={cn(
                  'size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  s < step
                    ? 'bg-primary-500 text-white cursor-pointer'
                    : s === step
                      ? 'bg-primary-500/20 text-primary-500 border-2 border-primary-500'
                      : 'bg-glass-light text-muted-foreground',
                )}
              >
                {s < step ? <Check size={12} /> : s}
              </button>
              {s < 3 && (
                <div className={cn(
                  'flex-1 h-0.5 rounded',
                  s < step ? 'bg-primary-500' : 'bg-glass-light',
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Input
              label="Battle Title"
              placeholder="e.g. Best Dance Showdown 2024"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
              error={titleError}
              icon={<Swords size={16} />}
            />

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Description (optional)
              </label>
              <textarea
                placeholder="Describe your battle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full glass-input rounded-xl p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              />
            </div>

            {/* Opponent Search */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Select Opponent
              </label>
              <div className="relative mb-2">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search opponents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                {filteredOpponents.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No opponents found</p>
                ) : (
                  filteredOpponents.map((opp) => (
                    <motion.button
                      key={opp.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setOpponentId(opp.id); setTitleError(''); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left',
                        opponentId === opp.id
                          ? 'bg-primary-500/10 border border-primary-500/30'
                          : 'hover:bg-glass-light border border-transparent',
                      )}
                    >
                      <Avatar src={opp.avatarUrl} name={opp.name} size="sm" isVerified={opp.isVerified} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate block">{opp.name}</span>
                        <span className="text-xs text-muted-foreground">@{opp.username}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground">{opp.fameScore}</span>
                        <span className="text-[9px] text-muted-foreground block">Score</span>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {selectedOpponent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2 rounded-xl bg-primary-500/10"
              >
                <Check size={14} className="text-primary-500 shrink-0" />
                <span className="text-xs text-foreground">
                  Opponent: <strong>{selectedOpponent.name}</strong>
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Category & Prize */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Category
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all text-center',
                      category === cat.id
                        ? 'bg-primary-500/15 border-2 border-primary-500'
                        : 'bg-glass-light border-2 border-transparent hover:bg-glass-medium',
                    )}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-[10px] font-medium text-foreground">{cat.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <Input
              label="Prize / Stakes"
              placeholder="e.g. 1000 Fame Coins"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              icon={<Trophy size={16} />}
            />

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Duration
              </label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <motion.button
                    key={d.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                      duration === d.value
                        ? 'bg-primary-500/15 border-2 border-primary-500 text-primary-500'
                        : 'bg-glass-light border-2 border-transparent text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Clock size={14} className="mx-auto mb-0.5" />
                    {d.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Rules */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Battle Rules
              </label>
              <div className="space-y-2">
                {RULE_PRESETS.map((rule) => (
                  <motion.button
                    key={rule}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleRule(rule)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                      rules.includes(rule)
                        ? 'bg-primary-500/10 border border-primary-500/30'
                        : 'bg-glass-light border border-transparent hover:bg-glass-medium',
                    )}
                  >
                    <div className={cn(
                      'size-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                      rules.includes(rule) ? 'border-primary-500 bg-primary-500' : 'border-muted-foreground/40',
                    )}>
                      {rules.includes(rule) && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm text-foreground">{rule}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card rounded-xl p-4 border border-white/10 space-y-2">
              <h5 className="text-xs font-semibold text-foreground">Battle Summary</h5>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Title: <span className="text-foreground font-medium">{title}</span></p>
                <p>Opponent: <span className="text-foreground font-medium">{selectedOpponent?.name}</span></p>
                <p>Category: <span className="text-foreground font-medium">{CATEGORIES.find(c => c.id === category)?.label}</span></p>
                <p>Duration: <span className="text-foreground font-medium">{DURATIONS.find(d => d.value === duration)?.label}</span></p>
                {prize && <p>Prize: <span className="text-foreground font-medium">{prize}</span></p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="md"
            onClick={step > 1 ? () => setStep(step - 1) : onClose}
            leftIcon={step > 1 ? undefined : undefined}
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>

          {step < 3 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => canContinue(step) && setStep(step + 1)}
              disabled={!canContinue(step)}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              isLoading={isCreating}
              leftIcon={<Zap size={16} />}
            >
              Create Battle
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
