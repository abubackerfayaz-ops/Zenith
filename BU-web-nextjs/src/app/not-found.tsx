import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 text-center">
        <div className="mb-4 text-7xl">404</div>
        <h2 className="mb-2 text-2xl font-bold">Page not found</h2>
        <p className="mb-6 text-muted-foreground">
          This page does not exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="lg">
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
