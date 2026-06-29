'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const NotificationList = dynamic(
  () =>
    import('@/components/notifications/notification-list').then(
      (m) => m.NotificationList,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      <NotificationList />
    </div>
  );
}
