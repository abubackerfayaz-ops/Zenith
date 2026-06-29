'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';
import { LoginForm } from '@/components/auth/login-form';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary-500/10 p-4">
      <div className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-5xl font-extrabold text-transparent">
          FameWars
        </h1>
        <p className="mt-2 text-muted-foreground">
          Where fame is the ultimate currency
        </p>
      </div>
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
