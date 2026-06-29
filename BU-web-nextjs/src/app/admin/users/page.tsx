'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const UserManagementTable = dynamic(
  () =>
    import('@/components/admin/user-management-table').then(
      (m) => m.UserManagementTable,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage platform users, roles, and permissions
        </p>
      </div>
      <UserManagementTable />
    </div>
  );
}
