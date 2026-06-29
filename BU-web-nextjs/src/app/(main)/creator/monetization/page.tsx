'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const WalletCard = dynamic(
  () =>
    import('@/components/monetization/wallet-card').then(
      (m) => m.WalletCard,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

const RevenueDashboard = dynamic(
  () =>
    import('@/components/monetization/revenue-dashboard').then(
      (m) => m.RevenueDashboard,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

const SubscriptionManager = dynamic(
  () =>
    import('@/components/monetization/subscription-manager').then(
      (m) => m.SubscriptionManager,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

export default function MonetizationPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Monetization</h1>
        <p className="text-muted-foreground">
          Manage your revenue, subscriptions, and wallet
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <RevenueDashboard />
          <SubscriptionManager />
        </div>
        <aside>
          <WalletCard />
        </aside>
      </div>
    </div>
  );
}
