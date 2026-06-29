'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  X,
  Type,
  Palette,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  Sparkles,
  RotateCcw,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';

const FONTS = [
  { id: 'sans', label: 'Sans', className: 'font-sans' },
  { id: 'serif', label: 'Serif', className: 'font-serif' },
  { id: 'mono', label: 'Mono', className: 'font-mono' },
  { id: 'bold', label: 'Bold', className: 'font-black tracking-tight' },
  { id: 'script', label: 'Script', className: 'font-light italic tracking-wide' },
];

const COLORS = [
  '#FFFFFF', '#000000', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
];

const TEXT_ALIGNS = [
  { id: 'left', icon: AlignLeft },
  { id: 'center', icon: AlignCenter },
  { id: 'right', icon: AlignRight },
];

interface StoryCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (media: File, textOverlay?: string) => void;
  className?: string;
}

export function StoryCreation({
  isOpen,
  onClose,
  onPost,
  className,
}: StoryCreationProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [textColor, setTextColor] = useState(COLORS[0]);
  const [textAlign, setTextAlign] = useState(TEXT_ALIGNS[0]);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'edit' | 'preview'>('upload');
  const canvasRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStep('edit');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'], 'video/*': ['.mp4', '.mov'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  const handleRemoveMedia = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMediaFile(null);
    setPreviewUrl(null);
    setTextOverlay('');
    setStep('upload');
  };

  const handlePost = () => {
    if (!mediaFile) return;
    onPost(mediaFile, textOverlay || undefined);
    handleRemoveMedia();
    onClose();
  };

  const isVideo = mediaFile?.type.startsWith('video/');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Story"
      size="lg"
      showCloseButton={false}
      className={cn('p-0', className)}
    >
      <div className="flex flex-col h-[600px] sm:h-[650px]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <button
            onClick={() => {
              if (step === 'edit') { setStep('upload'); handleRemoveMedia(); }
              else onClose();
            }}
            className="p-1.5 rounded-full hover:bg-glass-light text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
          <h2 className="text-sm font-semibold text-foreground">Create Story</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePost}
            disabled={!mediaFile}
            leftIcon={<Send size={14} />}
          >
            Share
          </Button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <div
                className={cn(
                  'flex flex-col items-center gap-4 p-12 rounded-2xl border-2 border-dashed transition-colors cursor-pointer',
                  isDragActive
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-white/10 hover:border-white/20',
                )}
              >
                <div className="p-4 rounded-full bg-primary-500/10">
                  <Image size={32} className="text-primary-500" />
                </div>
                <p className="text-sm text-foreground font-medium">
                  {isDragActive ? 'Drop your media here' : 'Tap to upload'}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Drag and drop or click to select<br />
                  Image or video up to 100MB
                </p>
                <Badge variant="primary">RECOMMENDED 9:16</Badge>
              </div>
            </motion.div>
          )}

          {step === 'edit' && previewUrl && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Canvas */}
              <div
                ref={canvasRef}
                className="flex-1 relative flex items-center justify-center bg-black/40 m-3 rounded-xl overflow-hidden"
                style={bgColor ? { backgroundColor: bgColor } : undefined}
              >
                {isVideo ? (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Story preview"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Text Overlay */}
                {textOverlay && (
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center p-6',
                      selectedFont.className,
                    )}
                    style={{ textAlign: textAlign.id as 'left' | 'center' | 'right' }}
                  >
                    <p
                      className="text-2xl sm:text-3xl font-bold drop-shadow-lg leading-tight"
                      style={{ color: textColor }}
                    >
                      {textOverlay}
                    </p>
                  </div>
                )}
              </div>

              {/* Edit Controls */}
              <div className="p-3 space-y-3 border-t border-white/10">
                {/* Text Input */}
                <div className="flex items-center gap-2">
                  <Type size={14} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Add text overlay..."
                    value={textOverlay}
                    onChange={(e) => setTextOverlay(e.target.value)}
                    maxLength={100}
                    className="flex-1 glass-input text-sm py-1.5 px-3 rounded-full"
                  />
                </div>

                {/* Fonts */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-full border transition-colors whitespace-nowrap',
                        selectedFont.id === font.id
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                          : 'border-white/10 text-muted-foreground hover:text-foreground',
                        font.className,
                      )}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>

                {/* Colors */}
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-muted-foreground shrink-0" />
                  <div className="flex gap-1.5 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={cn(
                          'size-6 rounded-full border-2 transition-transform',
                          textColor === color ? 'border-primary-500 scale-110' : 'border-transparent',
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    {COLORS.slice(0, 4).map((color) => (
                      <button
                        key={`bg-${color}`}
                        onClick={() => setBgColor(bgColor === color ? null : color)}
                        className={cn(
                          'size-6 rounded-lg border-2 transition-transform',
                          bgColor === color ? 'border-primary-500 scale-110' : 'border-transparent',
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {TEXT_ALIGNS.map((align) => {
                      const Icon = align.icon;
                      return (
                        <button
                          key={align.id}
                          onClick={() => setTextAlign(align)}
                          className={cn(
                            'p-1.5 rounded-md transition-colors',
                            textAlign.id === align.id
                              ? 'bg-primary-500/10 text-primary-500'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          <Icon size={14} />
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleRemoveMedia}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
