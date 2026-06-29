'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link,
  Check,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  QrCode,
  Image,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  className?: string;
}

const PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-500 bg-green-500/10' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500 bg-pink-500/10' },
  { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-500 bg-sky-500/10' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-600/10' },
  { id: 'copy', label: 'Copy Link', icon: Link, color: 'text-primary-500 bg-primary-500/10' },
  { id: 'qrcode', label: 'QR Code', icon: QrCode, color: 'text-accent-500 bg-accent-500/10' },
  { id: 'card', label: 'Social Card', icon: Image, color: 'text-amber-500 bg-amber-500/10' },
  { id: 'direct', label: 'Send via DM', icon: Send, color: 'text-emerald-500 bg-emerald-500/10' },
];

export function ShareModal({
  isOpen,
  onClose,
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Share',
  className,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      instagram: `https://www.instagram.com/`,
    };

    if (platform === 'copy') {
      handleCopyLink();
      return;
    }

    if (platform === 'qrcode') {
      setShowQR(!showQR);
      return;
    }

    const shareUrl = shareUrls[platform];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className={cn('p-0', className)}
    >
      <div className="p-4 space-y-4">
        {/* Platform Grid */}
        <div className="grid grid-cols-4 gap-3">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.button
                key={platform.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare(platform.id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl transition-colors',
                  'border border-white/10 hover:border-white/20',
                  platform.id === 'copy' && copied && 'border-green-500/50 bg-green-500/10',
                )}
              >
                <div className={cn('p-2.5 rounded-full', platform.color)}>
                  {platform.id === 'copy' && copied ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {copied && platform.id === 'copy' ? 'Copied!' : platform.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Copy Link */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10">
          <Link size={14} className="text-muted-foreground shrink-0 ml-1" />
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 bg-transparent text-xs text-muted-foreground focus:outline-none truncate"
            onClick={(e) => e.currentTarget.select()}
          />
          <Button
            variant={copied ? 'primary' : 'glass'}
            size="sm"
            onClick={handleCopyLink}
            className="shrink-0"
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <Check size={12} />
                Copied
              </span>
            ) : (
              'Copy'
            )}
          </Button>
        </div>

        {/* QR Code Section */}
        {showQR && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/10"
          >
            <div className="size-32 bg-white rounded-lg flex items-center justify-center">
              <QrCode size={80} className="text-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Scan to open this page
            </p>
          </motion.div>
        )}

        {/* Generate Social Card */}
        <Button
          variant="glass"
          fullWidth
          leftIcon={<Image size={16} />}
          className="mt-2"
        >
          Generate Social Card
        </Button>
      </div>
    </Modal>
  );
}
