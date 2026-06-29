'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Share2,
  Camera,
  Palette,
  Sun,
  Moon,
  Sparkles,
  Crown,
  Heart,
  Users,
  TrendingUp,
  Hash,
  Flame,
  Star,
  Check,
  Copy,
  MessageCircle,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs } from '@/components/ui/tabs';

type ThemeType = 'dark' | 'light' | 'gradient' | 'premium';

interface CardData {
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  followerCount: number;
  totalLikes: number;
  fameScore: number;
  viralScore: number;
  rank: number;
  level: string;
  personalityType?: string;
  bio?: string;
}

interface SocialCardGeneratorProps {
  data: CardData;
  onDownload?: (format: 'png' | 'jpeg') => void;
  onShare?: (platform: 'whatsapp' | 'instagram' | 'twitter') => void;
  className?: string;
}

const themes: Record<ThemeType, { label: string; icon: typeof Palette; preview: string; cardBg: string; textColor: string; accentGradient: string; borderColor: string }> = {
  dark: {
    label: 'Dark',
    icon: Moon,
    preview: 'bg-gray-900',
    cardBg: 'bg-gray-900 border-gray-700',
    textColor: 'text-white',
    accentGradient: 'from-primary-500 to-accent-500',
    borderColor: 'border-white/10',
  },
  light: {
    label: 'Light',
    icon: Sun,
    preview: 'bg-white',
    cardBg: 'bg-white border-gray-200',
    textColor: 'text-gray-900',
    accentGradient: 'from-primary-500 to-accent-500',
    borderColor: 'border-gray-200',
  },
  gradient: {
    label: 'Gradient',
    icon: Sparkles,
    preview: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500',
    cardBg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 border-white/20',
    textColor: 'text-white',
    accentGradient: 'from-white/30 to-white/10',
    borderColor: 'border-white/20',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    preview: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    cardBg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/30',
    textColor: 'text-white',
    accentGradient: 'from-amber-400 via-yellow-500 to-amber-600',
    borderColor: 'border-amber-500/30',
  },
};

function CardPreview({
  data,
  theme,
}: {
  data: CardData;
  theme: ThemeType;
}) {
  const t = themes[theme];

  return (
    <div
      id="social-card-preview"
      className={cn(
        'relative rounded-2xl p-6 border overflow-hidden w-full max-w-[400px] mx-auto shadow-2xl',
        t.cardBg,
        t.borderColor,
      )}
    >
      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Flame size={16} className="text-primary-500" />
            <span className={cn('text-xs font-bold tracking-wider', t.textColor)}>
              FAMEWARS
            </span>
          </div>
          <div className={cn('px-2 py-1 rounded-full bg-white/10 text-[9px] font-semibold', t.textColor)}>
            #{formatNumber(data.rank)}
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <Avatar
              src={data.avatarUrl}
              name={data.displayName}
              size="3xl"
              isVerified={data.isVerified}
            />
          </div>
          <h2 className={cn('text-lg font-bold', t.textColor)}>{data.displayName}</h2>
          <span className={cn('text-xs opacity-70', t.textColor)}>@{data.username}</span>
          {data.bio && (
            <p className={cn('text-xs mt-1 max-w-[250px] opacity-80', t.textColor)}>
              {data.bio}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className={cn('p-2.5 rounded-xl bg-white/10 text-center')}>
            <Users size={14} className="mx-auto mb-0.5 text-primary-500" />
            <span className={cn('text-sm font-bold block', t.textColor)}>
              {formatNumber(data.followerCount)}
            </span>
            <span className={cn('text-[8px] opacity-70', t.textColor)}>Followers</span>
          </div>
          <div className={cn('p-2.5 rounded-xl bg-white/10 text-center')}>
            <Heart size={14} className="mx-auto mb-0.5 text-red-500" />
            <span className={cn('text-sm font-bold block', t.textColor)}>
              {formatNumber(data.totalLikes)}
            </span>
            <span className={cn('text-[8px] opacity-70', t.textColor)}>Total Likes</span>
          </div>
          <div className={cn('p-2.5 rounded-xl bg-white/10 text-center')}>
            <Flame size={14} className="mx-auto mb-0.5 text-amber-500" />
            <span className={cn('text-sm font-bold block', t.textColor)}>
              {data.fameScore}
            </span>
            <span className={cn('text-[8px] opacity-70', t.textColor)}>Fame Score</span>
          </div>
          <div className={cn('p-2.5 rounded-xl bg-white/10 text-center')}>
            <TrendingUp size={14} className="mx-auto mb-0.5 text-green-500" />
            <span className={cn('text-sm font-bold block', t.textColor)}>
              {data.viralScore}%
            </span>
            <span className={cn('text-[8px] opacity-70', t.textColor)}>Viral Score</span>
          </div>
        </div>

        {/* Level & Personality */}
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="premium"
            className={cn('text-[9px]', t.textColor)}
          >
            {data.level}
          </Badge>
          {data.personalityType && (
            <Badge
              variant="primary"
              className="text-[9px]"
            >
              {data.personalityType}
            </Badge>
          )}
        </div>

        {/* Bottom Bar */}
        <div className={cn('pt-3 border-t flex items-center justify-between', t.borderColor)}>
          <div className="flex items-center gap-1 text-[8px] opacity-60">
            <span className={t.textColor}>Created on FameWars</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[...Array(3)].map((_, i) => (
              <Star key={i} size={8} className="text-amber-500 fill-amber-500" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SocialCardGenerator({
  data,
  onDownload,
  onShare,
  className,
}: SocialCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('dark');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async (format: 'png' | 'jpeg') => {
    onDownload?.(format);
  }, [onDownload]);

  const handleShare = useCallback((platform: 'whatsapp' | 'instagram' | 'twitter') => {
    onShare?.(platform);
    setShowShareMenu(false);
  }, [onShare]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://famewars.com/profile/${data.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeEntries = Object.entries(themes) as [ThemeType, typeof themes[ThemeType]][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card rounded-2xl border border-white/10 p-5',
        className,
      )}
    >
      {/* Preview */}
      <div className="mb-5">
        <CardPreview data={data} theme={selectedTheme} />
      </div>

      {/* Theme Selector */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-1.5">
          <Palette size={14} className="text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Background Theme</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {themeEntries.map(([key, theme]) => {
            const ThemeIcon = theme.icon;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTheme(key)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all',
                  selectedTheme === key
                    ? 'ring-2 ring-primary-500 bg-primary-500/10'
                    : 'hover:bg-glass-light',
                )}
              >
                <div className={cn('size-7 rounded-lg', theme.preview)} />
                <div className="flex items-center gap-1">
                  <ThemeIcon size={10} className="text-muted-foreground" />
                  <span className="text-[9px] font-medium text-muted-foreground">
                    {theme.label}
                  </span>
                </div>
                {selectedTheme === key && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="size-3 rounded-full bg-primary-500"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {/* Download */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            leftIcon={<Download size={14} />}
            onClick={() => handleDownload('png')}
          >
            Download PNG
          </Button>
          <Button
            variant="glass"
            size="md"
            leftIcon={<Download size={14} />}
            onClick={() => handleDownload('jpeg')}
            className="flex-shrink-0"
          >
            JPG
          </Button>
        </div>

        {/* Share */}
        <div className="relative">
          <Button
            variant="glass"
            size="md"
            fullWidth
            leftIcon={<Share2 size={14} />}
            onClick={() => setShowShareMenu(!showShareMenu)}
          >
            Share Card
          </Button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                ref={shareMenuRef}
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                className="absolute bottom-full left-0 right-0 mb-2 glass-heavy rounded-xl p-2 border border-white/10 shadow-xl"
              >
                <div className="grid grid-cols-3 gap-2">
                  <ShareButton
                    icon={<span className="text-lg">💬</span>}
                    label="WhatsApp"
                    onClick={() => handleShare('whatsapp')}
                  />
                  <ShareButton
                    icon={<span className="text-lg">📸</span>}
                    label="Instagram"
                    onClick={() => handleShare('instagram')}
                  />
                  <ShareButton
                    icon={<span className="text-lg">𝕏</span>}
                    label="X"
                    onClick={() => handleShare('twitter')}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Copy Link */}
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          leftIcon={copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          onClick={handleCopyLink}
        >
          {copied ? 'Link copied!' : 'Copy profile link'}
        </Button>
      </div>
    </motion.div>
  );
}

function ShareButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-glass-light transition-colors"
    >
      {icon}
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </button>
  );
}
