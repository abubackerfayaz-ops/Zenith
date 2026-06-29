'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  Ban,
  Trash2,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UserRole = 'USER' | 'CREATOR' | 'ADMIN';
type UserStatus = 'active' | 'banned' | 'verified';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
}

const mockUsers: User[] = Array.from({ length: 46 }, (_, i) => {
  const roles: UserRole[] = ['USER', 'CREATOR', 'ADMIN'];
  const statuses: UserStatus[] = ['active', 'banned', 'verified'];
  return {
    id: `user-${i + 1}`,
    username: `user_${String(i + 1).padStart(3, '0')}`,
    email: `user${i + 1}@example.com`,
    avatar: null,
    role: roles[i % 3],
    status: statuses[i % 3],
    joinDate: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
});

const ROLE_STYLES: Record<UserRole, string> = {
  USER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CREATOR: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const STATUS_STYLES: Record<UserStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  banned: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  verified: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  USER: UserCheck,
  CREATOR: ShieldCheck,
  ADMIN: Shield,
};

const ITEMS_PER_PAGE = 10;

function StatusIcon({ status }: { status: UserStatus }) {
  switch (status) {
    case 'active':
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'banned':
      return <XCircle className="w-3.5 h-3.5" />;
    case 'verified':
      return <Clock className="w-3.5 h-3.5" />;
  }
}

export default function UserManagementTable() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let users = mockUsers;

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== 'ALL') users = users.filter((u) => u.role === roleFilter);
    if (statusFilter !== 'ALL')
      users = users.filter((u) => u.status === statusFilter);

    return users;
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const filterButton = (
    label: string,
    value: string,
    active: boolean,
    onClick: () => void,
  ) => (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
        active
          ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
          : 'text-muted-foreground border-white/10 hover:bg-glass-light',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="glass-card">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="glass-input w-full pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Role:</span>
          {(['ALL', 'USER', 'CREATOR', 'ADMIN'] as const).map((r) =>
            filterButton(r, r, roleFilter === r, () => {
              setRoleFilter(r);
              setPage(0);
            }),
          )}

          <div className="w-px h-5 bg-white/10 mx-2" />

          <span className="text-xs text-muted-foreground mr-1">Status:</span>
          {(['ALL', 'active', 'banned', 'verified'] as const).map((s) =>
            filterButton(s, s, statusFilter === s, () => {
              setStatusFilter(s);
              setPage(0);
            }),
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                User
              </th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                Email
              </th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                Role
              </th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">
                Joined
              </th>
              <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginated.map((user) => (
                <motion.tr
                  key={user.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-white/5 hover:bg-glass-light transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        ROLE_STYLES[user.role],
                      )}
                    >
                      {(() => {
                        const Icon = ROLE_ICONS[user.role];
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        STATUS_STYLES[user.status],
                      )}
                    >
                      <StatusIcon status={user.status} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(user.joinDate)}
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === user.id ? null : user.id)
                      }
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {openMenu === user.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          className="absolute right-0 mt-1 w-40 glass-heavy rounded-lg border border-white/10 py-1 z-50 shadow-xl"
                        >
                          {[
                            { icon: Eye, label: 'View Profile' },
                            { icon: Edit3, label: 'Edit User' },
                            { icon: CheckCircle2, label: 'Verify' },
                            { icon: Ban, label: 'Ban User' },
                            { icon: Trash2, label: 'Delete', danger: true },
                          ].map((action) => (
                            <button
                              key={action.label}
                              onClick={() => setOpenMenu(null)}
                              className={cn(
                                'flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium transition-colors',
                                action.danger
                                  ? 'text-rose-400 hover:bg-rose-500/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-glass-light',
                              )}
                            >
                              <action.icon className="w-3.5 h-3.5" />
                              {action.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No users found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
        <span className="text-xs text-muted-foreground">
          Showing {(page * ITEMS_PER_PAGE) + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of{' '}
          {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                page === i
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-glass-light',
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
