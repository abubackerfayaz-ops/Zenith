'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
        <p className="mb-6 text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={reset} variant="primary" size="lg">
          Try again
        </Button>
      </Card>
    </div>
  );
}
