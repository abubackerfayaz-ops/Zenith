'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Send,
  Heart,
  Sparkles,
  MessageSquare,
  X,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

const COIN_EMOJIS = ['🪙', '✨', '💫', '🌟', '💎'];

interface TipModalProps {
  open: boolean;
  onClose: () => void;
  creator?: {
    username: string;
    avatar: string | null;
  };
}

export default function TipModal({ open, onClose, creator }: TipModalProps) {
  const [amount, setAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'sending' | 'done'>(
    'select',
  );
  const [showCoins, setShowCoins] = useState(false);
  const [coinParticles, setCoinParticles] = useState<
    { id: number; x: number; y: number; emoji: string; delay: number }[]
  >([]);

  const tipAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleSend = useCallback(() => {
    setStep('sending');
    setShowCoins(true);

    const particles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200,
      y: -Math.random() * 300 - 100,
      emoji: COIN_EMOJIS[i % COIN_EMOJIS.length],
      delay: i * 0.08,
    }));
    setCoinParticles(particles);

    setTimeout(() => {
      setStep('done');
      setShowCoins(false);
    }, 1500);
  }, []);

  function reset() {
    setStep('select');
    setAmount(5);
    setCustomAmount('');
    setMessage('');
    setCoinParticles([]);
    setShowCoins(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const displayName = creator?.username || 'Creator';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-heavy rounded-2xl border border-white/10 w-full max-w-md overflow-hidden relative"
          >
            {/* Coin Animation Overlay */}
            <AnimatePresence>
              {showCoins && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
                >
                  {coinParticles.map((p) => (
                    <motion.span
                      key={p.id}
                      initial={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 0,
                      }}
                      animate={{
                        opacity: [1, 1, 0],
                        x: p.x,
                        y: p.y,
                        scale: [0, 1.5, 0],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 1.2,
                        delay: p.delay,
                        ease: 'easeOut',
                      }}
                      className="text-3xl absolute"
                    >
                      {p.emoji}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Send a Tip
                </h2>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg font-bold">
                  {displayName[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {displayName}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3 h-3 text-rose-400" />
                    Send your support
                  </div>
                </div>
              </div>
            </div>

            {step === 'select' && (
              <div className="p-6 space-y-4">
                {/* Preset Amounts */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setAmount(preset);
                          setCustomAmount('');
                        }}
                        className={cn(
                          'py-3 rounded-lg text-sm font-semibold border transition-all',
                          amount === preset && !customAmount
                            ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                            : 'bg-glass-light text-muted-foreground border-white/10 hover:text-foreground hover:border-white/20',
                        )}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Custom Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        if (e.target.value) setAmount(0);
                      }}
                      className="glass-input w-full pl-7 text-sm"
                      placeholder="Enter amount..."
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Message (optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="glass-input w-full pl-10 text-sm resize-none h-20"
                      placeholder="Say something nice..."
                      maxLength={200}
                    />
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground mt-1">
                    {message.length}/200
                  </div>
                </div>

                {/* Send Button */}
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!tipAmount || tipAmount <= 0}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  Send ${tipAmount.toFixed(2)} Tip
                </button>
              </div>
            )}

            {step === 'confirm' && (
              <div className="p-6 space-y-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-4xl font-bold text-foreground mb-1">
                    ${tipAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tip for {displayName}
                  </div>
                  {message && (
                    <div className="mt-3 p-3 rounded-lg bg-glass-light text-xs text-foreground">
                      "{message}"
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSend}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Confirm & Send
                </button>
                <button
                  onClick={() => setStep('select')}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change amount
                </button>
              </div>
            )}

            {step === 'done' && (
              <div className="p-6 text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Tip Sent!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You sent ${tipAmount.toFixed(2)} to {displayName}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
