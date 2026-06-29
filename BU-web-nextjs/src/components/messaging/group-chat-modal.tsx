'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Camera,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface GroupMember {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: GroupMember[];
  onCreateGroup: (data: { name: string; memberIds: string[]; image?: File }) => void;
  isCreating?: boolean;
  existingGroup?: {
    id: string;
    name: string;
    imageUrl?: string;
    members: string[];
  };
}

export function GroupChatModal({
  isOpen,
  onClose,
  users,
  onCreateGroup,
  isCreating = false,
  existingGroup,
}: GroupChatModalProps) {
  const [groupName, setGroupName] = useState(existingGroup?.name || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(existingGroup?.members || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existingGroup?.imageUrl || '');
  const [nameError, setNameError] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const toggleMember = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!groupName.trim()) {
      setNameError('Group name is required');
      return;
    }
    if (selectedIds.length < 2) {
      setNameError('Select at least 2 members');
      return;
    }
    setNameError('');
    onCreateGroup({
      name: groupName.trim(),
      memberIds: selectedIds,
      image: imageFile || undefined,
    });
  };

  const isEditing = !!existingGroup;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Group' : 'New Group Chat'}
      size="lg"
    >
      <div className="space-y-4">
        {/* Group Image */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="size-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5">
              <div className="size-full rounded-full bg-background overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Group"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users size={28} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary-500 text-white cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-xs text-muted-foreground">Group Photo</span>
        </div>

        {/* Group Name */}
        <div>
          <Input
            label="Group Name"
            placeholder="Enter group name..."
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              if (nameError) setNameError('');
            }}
            error={nameError}
            icon={<Users size={16} />}
          />
        </div>

        {/* Member Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground font-medium">
            Members ({selectedIds.length})
          </span>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-primary-500 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        {/* Selected Users Pills */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedIds.map((id) => {
              const user = users.find((u) => u.id === id);
              if (!user) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-500/15 text-primary-500 text-xs"
                >
                  {user.name}
                  <button
                    onClick={() => toggleMember(id)}
                    className="hover:text-primary-300 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* User List */}
        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <motion.button
                  key={user.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleMember(user.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                    isSelected
                      ? 'bg-primary-500/10 border border-primary-500/30'
                      : 'hover:bg-glass-light border border-transparent',
                  )}
                >
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    size="sm"
                    isVerified={user.isVerified}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {user.name}
                      </span>
                      {user.isVerified && (
                        <span className="text-primary-500 text-[10px]">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'size-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0',
                      isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-muted-foreground/40',
                    )}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Create/Update Button */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleSubmit}
          isLoading={isCreating}
          disabled={!groupName.trim() || selectedIds.length < 2}
          leftIcon={<Users size={18} />}
        >
          {isEditing ? 'Update Group' : `Create Group${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`}
        </Button>
      </div>
    </Modal>
  );
}
