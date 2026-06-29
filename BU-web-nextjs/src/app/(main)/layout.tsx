'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Spinner } from '@/components/ui/spinner';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {!isMobile && <Sidebar />}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="custom-scrollbar flex-1 overflow-y-auto px-4 pb-20 pt-4 md:pb-4">
          {children}
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}
