'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Flame,
  Check,
  ArrowRight,
  ArrowLeft,
  Chrome,
  Apple,
  Facebook,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const step1Schema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be fewer than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional(),
});

const step2Schema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the terms' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

interface RegisterFormProps {
  onSubmit?: (data: Step1Data & Step2Data) => void;
  onSocialRegister?: (provider: 'google' | 'apple' | 'facebook') => void;
  isLoading?: boolean;
  className?: string;
}

export function RegisterForm({
  onSubmit,
  onSocialRegister,
  isLoading = false,
  className,
}: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { username: '', email: '', phone: '' },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { password: '', confirmPassword: '', agreeToTerms: false },
  });

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    if (!step1Data) return;
    onSubmit?.({ ...step1Data, ...data });
  };

  const goBack = () => {
    setStep(1);
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
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join the fame revolution
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step === s
                    ? 'bg-primary-500 text-white'
                    : step > s
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-muted-foreground',
                )}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 2 && (
                <div
                  className={cn(
                    'w-8 h-0.5 rounded transition-colors',
                    step > s ? 'bg-green-500' : 'bg-white/10',
                  )}
                />
              )}
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            Step {step} of 2
          </span>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Social Register */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { provider: 'google' as const, icon: Chrome, label: 'Google' },
                  { provider: 'apple' as const, icon: Apple, label: 'Apple' },
                  { provider: 'facebook' as const, icon: Facebook, label: 'Facebook' },
                ].map(({ provider, icon: Icon, label }) => (
                  <motion.button
                    key={provider}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSocialRegister?.(provider)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all"
                  >
                    <Icon size={18} className="text-foreground" />
                    <span className="hidden sm:inline text-xs font-medium text-foreground">{label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs text-muted-foreground bg-gradient-to-br from-white/[0.08] to-white/[0.02]">
                    or sign up with email
                  </span>
                </div>
              </div>

              <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                <Input
                  label="Username"
                  placeholder="Choose a username"
                  icon={<User size={16} />}
                  error={step1Form.formState.errors.username?.message}
                  {...step1Form.register('username')}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  icon={<Mail size={16} />}
                  error={step1Form.formState.errors.email?.message}
                  {...step1Form.register('email')}
                />
                <Input
                  label="Phone (optional)"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  icon={<Phone size={16} />}
                  error={step1Form.formState.errors.phone?.message}
                  {...step1Form.register('phone')}
                />

                <Button type="submit" variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={16} />}>
                  Continue
                </Button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  icon={<Lock size={16} />}
                  error={step2Form.formState.errors.password?.message}
                  {...step2Form.register('password')}
                />
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  icon={<Lock size={16} />}
                  error={step2Form.formState.errors.confirmPassword?.message}
                  {...step2Form.register('confirmPassword')}
                />

                {/* Password Requirements */}
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Info size={12} className="text-primary-500" />
                    Password requirements:
                  </div>
                  {[
                    'At least 8 characters',
                    'One uppercase letter',
                    'One number',
                  ].map((req) => (
                    <div key={req} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                      {req}
                    </div>
                  ))}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-transparent accent-primary-500"
                    {...step2Form.register('agreeToTerms')}
                  />
                  <span className="text-xs text-muted-foreground">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-500 hover:text-primary-400">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-500 hover:text-primary-400">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {step2Form.formState.errors.agreeToTerms && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <Info size={12} />
                    {step2Form.formState.errors.agreeToTerms.message}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="glass"
                    size="lg"
                    onClick={goBack}
                    leftIcon={<ArrowLeft size={16} />}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link
            href={ROUTES.LOGIN}
            className="text-primary-500 hover:text-primary-400 font-semibold transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
