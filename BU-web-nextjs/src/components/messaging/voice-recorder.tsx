'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Send, X, Trash2 } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel?: () => void;
  maxDuration?: number;
  className?: string;
}

export function VoiceRecorder({
  onSend,
  onCancel,
  maxDuration = 60,
  className,
}: VoiceRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = '';
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioUrlRef.current = URL.createObjectURL(blob);
        audioRef.current = new Audio(audioUrlRef.current);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setPlaybackProgress(1);
        };
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            setPlaybackProgress(audioRef.current.currentTime / audioRef.current.duration);
          }
        };
      };

      mediaRecorder.start();
      setStatus('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (duration >= 1) {
      setStatus('preview');
    } else {
      setStatus('idle');
      cleanup();
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSend = () => {
    if (audioChunksRef.current.length === 0) return;
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    onSend(blob, duration);
    cleanup();
    setStatus('idle');
    setDuration(0);
  };

  const handleCancel = () => {
    cleanup();
    setStatus('idle');
    setDuration(0);
    onCancel?.();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.button
            key="record"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={startRecording}
            className="p-2.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-colors"
            title="Start recording"
          >
            <Mic size={18} />
          </motion.button>
        )}

        {status === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 glass-heavy rounded-2xl px-4 py-2 border border-white/10"
          >
            {/* Recording Indicator */}
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="size-2.5 rounded-full bg-red-500"
              />
              <span className="text-sm font-semibold text-red-500 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Waveform Preview */}
            <div className="flex items-center gap-0.5 h-8">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: `${20 + Math.random() * 60}%`,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.3 + Math.random() * 0.4,
                    delay: i * 0.02,
                  }}
                  className="w-1 rounded-full bg-primary-500/60"
                />
              ))}
            </div>

            {/* Stop */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Stop recording"
            >
              <Square size={12} />
            </motion.button>
          </motion.div>
        )}

        {status === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 glass-heavy rounded-2xl px-3 py-1.5 border border-white/10"
          >
            {/* Play/Pause */}
            <button
              onClick={togglePlayback}
              className="p-1.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            {/* Waveform */}
            <div className="flex items-center gap-px h-6">
              {Array.from({ length: 20 }).map((_, i) => {
                const isActive = i / 20 <= playbackProgress;
                return (
                  <div
                    key={i}
                    className="w-[3px] rounded-full transition-colors"
                    style={{
                      height: `${4 + Math.sin(i * 0.8) * 6 + 4}px`,
                      backgroundColor: isActive ? 'rgb(14 165 233)' : 'rgba(255,255,255,0.15)',
                    }}
                  />
                );
              })}
            </div>

            <span className="text-xs text-muted-foreground tabular-nums">{formatTime(duration)}</span>

            {/* Cancel */}
            <button
              onClick={handleCancel}
              className="p-1 rounded-full hover:bg-glass-light text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>

            {/* Send */}
            <button
              onClick={handleSend}
              className="p-1.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <Send size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
