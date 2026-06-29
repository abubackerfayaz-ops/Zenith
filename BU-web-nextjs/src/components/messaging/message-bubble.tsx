'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCheck,
  Clock,
  Reply,
  Copy,
  Trash2,
  Flag,
  Play,
  Pause,
  Volume2,
  Maximize2,
} from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Menu } from '@/components/ui/menu';

interface ReplyPreview {
  id: string;
  text: string;
  senderName: string;
}

interface MessageBubbleProps {
  id: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  isSent: boolean;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  isRead?: boolean;
  isEdited?: boolean;
  replyTo?: ReplyPreview | null;
  onReply?: (messageId: string) => void;
  onCopy?: (text: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  className?: string;
}

export function MessageBubble({
  id,
  text,
  imageUrl,
  videoUrl,
  voiceUrl,
  voiceDuration = 0,
  isSent,
  senderName,
  senderAvatar,
  timestamp,
  isRead = false,
  isEdited = false,
  replyTo = null,
  onReply,
  onCopy,
  onDelete,
  onReport,
  className,
}: MessageBubbleProps) {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const menuItems = [
    {
      id: 'reply',
      label: 'Reply',
      icon: <Reply size={14} />,
      onClick: () => onReply?.(id),
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy size={14} />,
      onClick: () => text && onCopy?.(text),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => onDelete?.(id),
    },
    {
      id: 'report',
      label: 'Report',
      icon: <Flag size={14} />,
      danger: true,
      onClick: () => onReport?.(id),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      layout
      className={cn(
        'flex items-end gap-2 max-w-[85%] group',
        isSent ? 'ml-auto flex-row-reverse' : 'mr-auto',
        className,
      )}
    >
      {!isSent && senderAvatar && (
        <Avatar src={senderAvatar} name={senderName} size="xs" className="mb-1" />
      )}

      <div className={cn('flex flex-col', isSent ? 'items-end' : 'items-start')}>
        {/* Sender Name */}
        {!isSent && senderName && (
          <span className="text-[10px] text-muted-foreground font-medium mb-0.5 px-1">
            {senderName}
          </span>
        )}

        {/* Reply Preview */}
        {replyTo && (
          <div
            className={cn(
              'text-xs p-2 rounded-lg mb-1 border-l-2 max-w-full',
              isSent
                ? 'bg-primary-500/20 border-primary-300 text-right'
                : 'bg-glass-light border-muted-foreground/50 text-left',
            )}
          >
            <span className="text-[10px] font-medium text-primary-500 block">
              {replyTo.senderName}
            </span>
            <span className="text-muted-foreground truncate block max-w-[200px]">
              {replyTo.text}
            </span>
          </div>
        )}

        {/* Image */}
        {imageUrl && (
          <div className="relative rounded-2xl overflow-hidden mb-1 cursor-pointer group/image">
            <img
              src={imageUrl}
              alt="Message image"
              className="max-w-[280px] w-full h-auto object-cover rounded-2xl"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
              <Maximize2 size={20} className="text-white opacity-0 group-hover/image:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* Video */}
        {videoUrl && (
          <div className="relative rounded-2xl overflow-hidden mb-1">
            <video
              src={videoUrl}
              className="max-w-[280px] w-full h-auto rounded-2xl"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        )}

        {/* Voice Message */}
        {voiceUrl && (
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-2xl mb-1 min-w-[200px]',
              isSent ? 'bg-primary-500/20' : 'bg-glass-light',
            )}
          >
            <button
              onClick={() => setIsPlayingVoice(!isPlayingVoice)}
              className="p-1.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors shrink-0"
            >
              {isPlayingVoice ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <div className="flex-1 space-y-1">
              <div className="relative h-6 flex items-center gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => {
                  const height = 4 + Math.sin(i * 0.8 + voiceProgress * 10) * 8 + Math.random() * 4;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-full bg-primary-500/60 transition-all duration-150"
                      style={{ height: `${Math.max(2, height)}px` }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{formatDuration(voiceDuration * voiceProgress)}</span>
                <span>{formatDuration(voiceDuration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Text */}
        {text && (
          <div
            className={cn(
              'relative px-3 py-2 text-sm leading-relaxed break-words',
              isSent
                ? 'bg-primary-500 text-white rounded-2xl rounded-br-md'
                : 'bg-glass-light text-foreground rounded-2xl rounded-bl-md',
            )}
          >
            {text}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-1 mt-0.5 px-1">
          <Menu
            trigger={
              <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-glass-light text-muted-foreground transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            }
            items={menuItems}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />

          {isEdited && (
            <span className="text-[9px] text-muted-foreground">edited</span>
          )}
          <span className="text-[9px] text-muted-foreground tabular-nums">
            {timeAgo(timestamp)}
          </span>
          {isSent && (
            <span className="text-[10px]" title={isRead ? 'Read' : 'Sent'}>
              {isRead ? (
                <CheckCheck size={12} className="text-primary-500" />
              ) : (
                <Clock size={12} className="text-muted-foreground" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
