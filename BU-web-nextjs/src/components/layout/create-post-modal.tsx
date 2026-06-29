'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Video,
  X,
  MapPin,
  Hash,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileImage,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MediaPreview {
  id: string;
  url: string;
  type: 'image' | 'video';
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  onSubmit?: (data: {
    caption: string;
    hashtags: string[];
    location: string;
    media: MediaPreview[];
  }) => void;
  isSubmitting?: boolean;
}

export function CreatePostModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isSubmitting = false,
}: CreatePostModalProps) {
  const [step, setStep] = useState<'upload' | 'details'>('upload');
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const resetForm = () => {
    setStep('upload');
    setMedia([]);
    setCaption('');
    setHashtagInput('');
    setHashtags([]);
    setLocation('');
    setCurrentMediaIndex(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    if (files.length > 0) {
      const newMedia = files.map((f) => ({
        id: Math.random().toString(36).slice(2),
        url: URL.createObjectURL(f),
        type: f.type.startsWith('video/') ? 'video' as const : 'image' as const,
      }));
      setMedia((prev) => [...prev, ...newMedia]);
      setStep('details');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    if (files.length > 0) {
      const newMedia = files.map((f) => ({
        id: Math.random().toString(36).slice(2),
        url: URL.createObjectURL(f),
        type: f.type.startsWith('video/') ? 'video' as const : 'image' as const,
      }));
      setMedia((prev) => [...prev, ...newMedia]);
      setStep('details');
    }
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    if (media.length <= 1) {
      setStep('upload');
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addHashtag();
    }
    if (e.key === 'Backspace' && !hashtagInput && hashtags.length > 0) {
      setHashtags((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (media.length === 0) return;
    onSubmit?.({ caption, hashtags, location, media });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg glass-heavy rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="w-10">
            {step === 'details' && (
              <button
                onClick={() => setStep('upload')}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
          </div>
          <h2 className="text-base font-semibold text-foreground">Create Post</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {step === 'upload' && (
            <UploadStep
              dragOver={dragOver}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              media={media}
            />
          )}

          {step === 'details' && (
            <DetailsStep
              user={user}
              media={media}
              currentMediaIndex={currentMediaIndex}
              onMediaSelect={setCurrentMediaIndex}
              onRemoveMedia={removeMedia}
              caption={caption}
              onCaptionChange={setCaption}
              hashtagInput={hashtagInput}
              onHashtagInputChange={setHashtagInput}
              onHashtagKeyDown={handleHashtagKeyDown}
              hashtags={hashtags}
              onRemoveHashtag={removeHashtag}
              location={location}
              onLocationChange={setLocation}
              onAddMedia={() => setStep('upload')}
            />
          )}
        </div>

        {step === 'details' && (
          <div className="p-4 border-t border-white/10">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              disabled={media.length === 0}
              onClick={handleSubmit}
            >
              Share Post
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function UploadStep({
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  media,
}: {
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  media: MediaPreview[];
}) {
  return (
    <div className="p-8">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer',
          dragOver
            ? 'border-primary-500 bg-primary-500/10 scale-[1.02]'
            : 'border-white/20 hover:border-primary-500/50 hover:bg-glass-light',
        )}
      >
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={onFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <motion.div
          animate={{ scale: dragOver ? 1.1 : 1 }}
          className={cn(
            'p-4 rounded-full mb-4 transition-colors',
            dragOver ? 'bg-primary-500/20' : 'bg-glass-light',
          )}
        >
          <Upload
            size={36}
            className={dragOver ? 'text-primary-500' : 'text-muted-foreground'}
          />
        </motion.div>

        <p className="text-base font-semibold text-foreground mb-1">
          Drag & drop media here
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Image size={14} /> Image
          </span>
          <span className="flex items-center gap-1">
            <Video size={14} /> Video
          </span>
        </div>
      </div>

      {media.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {media.map((m) => (
            <div key={m.id} className="relative size-16 rounded-lg overflow-hidden">
              <img
                src={m.url}
                alt=""
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailsStep({
  user,
  media,
  currentMediaIndex,
  onMediaSelect,
  onRemoveMedia,
  caption,
  onCaptionChange,
  hashtagInput,
  onHashtagInputChange,
  onHashtagKeyDown,
  hashtags,
  onRemoveHashtag,
  location,
  onLocationChange,
  onAddMedia,
}: {
  user?: { username: string; displayName: string; avatarUrl?: string | null } | null;
  media: MediaPreview[];
  currentMediaIndex: number;
  onMediaSelect: (i: number) => void;
  onRemoveMedia: (id: string) => void;
  caption: string;
  onCaptionChange: (v: string) => void;
  hashtagInput: string;
  onHashtagInputChange: (v: string) => void;
  onHashtagKeyDown: (e: React.KeyboardEvent) => void;
  hashtags: string[];
  onRemoveHashtag: (tag: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  onAddMedia: () => void;
}) {
  return (
    <div className="p-4 space-y-4">
      {user && (
        <div className="flex items-center gap-3">
          <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {user.displayName}
            </p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden bg-black/40">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentMediaIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={media[currentMediaIndex]?.url}
            alt=""
            className="w-full h-64 object-cover"
          />
        </AnimatePresence>

        {media.length > 1 && (
          <>
            {currentMediaIndex > 0 && (
              <button
                onClick={() => onMediaSelect(currentMediaIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {currentMediaIndex < media.length - 1 && (
              <button
                onClick={() => onMediaSelect(currentMediaIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onMediaSelect(i)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    i === currentMediaIndex
                      ? 'bg-white w-3'
                      : 'bg-white/50',
                  )}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => onRemoveMedia(media[currentMediaIndex]?.id)}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <button
        onClick={onAddMedia}
        className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-400 transition-colors"
      >
        <FileImage size={16} />
        Add more media
      </button>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Write a caption..."
          rows={3}
          maxLength={2200}
          className="glass-input w-full resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground text-right">
          {caption.length}/2200
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Hash size={12} /> Hashtags
        </label>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {hashtags.map((tag) => (
            <Badge
              key={tag}
              variant="primary"
              className="cursor-pointer"
              onClick={() => onRemoveHashtag(tag)}
            >
              #{tag} <X size={10} className="ml-0.5" />
            </Badge>
          ))}
        </div>
        <input
          type="text"
          value={hashtagInput}
          onChange={(e) => onHashtagInputChange(e.target.value)}
          onKeyDown={onHashtagKeyDown}
          placeholder="Add hashtags..."
          className="glass-input w-full text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <MapPin size={12} /> Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Add location..."
          className="glass-input w-full text-sm"
        />
      </div>
    </div>
  );
}
