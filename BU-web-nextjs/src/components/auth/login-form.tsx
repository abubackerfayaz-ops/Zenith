'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Flame,
  Chrome,
  Apple,
  Facebook,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
  onSocialLogin?: (provider: 'google' | 'apple' | 'facebook') => void;
  isLoading?: boolean;
  className?: string;
}

export function LoginForm({
  onSubmit,
  onSocialLogin,
  isLoading = false,
  className,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const handleFormSubmit = (data: LoginFormData) => {
    onSubmit?.(data);
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
          className="flex justify-center mb-6"
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20">
            <Flame size={32} className="text-primary-500" />
          </div>
        </motion.div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log in to continue your fame journey
          </p>
        </div>

        {/* Social Login */}
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
              onClick={() => onSocialLogin?.(provider)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <Icon size={18} className="text-foreground" />
              <span className="hidden sm:inline text-xs font-medium text-foreground">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs text-muted-foreground bg-gradient-to-br from-white/[0.08] to-white/[0.02]">
              or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Email or Username"
            type="text"
            placeholder="Enter your email or username"
            icon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-transparent accent-primary-500"
                {...register('rememberMe')}
              />
              <span className="text-xs text-muted-foreground">Remember me</span>
            </label>
            <Link
              href={ROUTES.LOGIN}
              className="text-xs text-primary-500 hover:text-primary-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Log In
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href={ROUTES.REGISTER}
            className="text-primary-500 hover:text-primary-400 font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
