'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Flame,
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const codeSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailData = z.infer<typeof emailSchema>;
type CodeData = z.infer<typeof codeSchema>;
type ResetData = z.infer<typeof resetSchema>;

interface ForgotPasswordFormProps {
  onSendCode?: (email: string) => Promise<void>;
  onVerifyCode?: (code: string) => Promise<boolean>;
  onResetPassword?: (password: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const STEPS = ['Email', 'Verify', 'Reset'];

export function ForgotPasswordForm({
  onSendCode,
  onVerifyCode,
  onResetPassword,
  isLoading = false,
  className,
}: ForgotPasswordFormProps) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  const emailForm = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<CodeData>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const resetForm = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const startCountdown = useCallback(() => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = async (data: EmailData) => {
    setEmail(data.email);
    await onSendCode?.(data.email);
    setCodeSent(true);
    startCountdown();
    setStep(1);
  };

  const handleVerifyCode = async (data: CodeData) => {
    const success = await onVerifyCode?.(data.code);
    if (success) {
      setVerified(true);
      setStep(2);
    }
  };

  const handleResetPassword = async (data: ResetData) => {
    await onResetPassword?.(data.password);
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    onSendCode?.(email);
    startCountdown();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 sm:p-8',
        'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'border border-white/10 shadow-xl backdrop-blur-xl',
        className,
      )}
    >
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="flex justify-center mb-4"
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20">
            <Flame size={32} className="text-primary-500" />
          </div>
        </motion.div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 0 && "Enter your email and we'll send you a code"}
            {step === 1 && 'Enter the verification code sent to your email'}
            {step === 2 && 'Create a new password for your account'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step === i
                    ? 'bg-primary-500 text-white'
                    : step > i
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-muted-foreground',
                )}
              >
                {step > i ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-0.5 rounded transition-colors',
                    step > i ? 'bg-green-500' : 'bg-white/10',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your registered email"
                  icon={<Mail size={16} />}
                  error={emailForm.formState.errors.email?.message}
                  {...emailForm.register('email')}
                />

                <Button type="submit" variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={16} />}>
                  Send Code
                </Button>
              </form>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="code-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-4">
                <Input
                  label="Verification Code"
                  type="text"
                  placeholder="000000"
                  icon={<KeyRound size={16} />}
                  maxLength={6}
                  error={codeForm.formState.errors.code?.message}
                  {...codeForm.register('code')}
                />

                {codeSent && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <ShieldCheck size={14} className="text-green-500 shrink-0" />
                    <span className="text-xs text-green-500">
                      Code sent to {email}
                    </span>
                  </div>
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
                  Verify Code
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className={cn(
                      'text-xs font-medium transition-colors',
                      countdown > 0
                        ? 'text-muted-foreground cursor-not-allowed'
                        : 'text-primary-500 hover:text-primary-400',
                    )}
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                  <ArrowLeft size={12} />
                  Change email
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="reset-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  icon={<Lock size={16} />}
                  error={resetForm.formState.errors.password?.message}
                  {...resetForm.register('password')}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                  icon={<Lock size={16} />}
                  error={resetForm.formState.errors.confirmPassword?.message}
                  {...resetForm.register('confirmPassword')}
                />

                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                  Reset Password
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Login */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{' '}
          <Link
            href={ROUTES.LOGIN}
            className="text-primary-500 hover:text-primary-400 font-semibold transition-colors"
          >
            Back to login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
