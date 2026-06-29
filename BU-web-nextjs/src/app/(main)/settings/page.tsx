'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/ui/empty-state';

const settingTabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'two-factor', label: 'Two-Factor' },
];

function ProfileSettings() {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Display name</label>
        <Input placeholder="Your display name" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <Input placeholder="Tell the world about yourself" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Website</label>
        <Input placeholder="https://" />
      </div>
      <Button variant="primary">Save changes</Button>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          Current password
        </label>
        <Input type="password" placeholder="********" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          New password
        </label>
        <Input type="password" placeholder="New password" />
      </div>
      <Button variant="primary">Update account</Button>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Private account</p>
          <p className="text-sm text-muted-foreground">
            Only approved followers can see your content
          </p>
        </div>
        <Switch />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Show activity status</p>
          <p className="text-sm text-muted-foreground">
            Let others see when you&apos;re active
          </p>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Push notifications</p>
          <p className="text-sm text-muted-foreground">
            Receive push notifications
          </p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Battle invites</p>
          <p className="text-sm text-muted-foreground">
            Get notified when someone challenges you
          </p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">New followers</p>
          <p className="text-sm text-muted-foreground">
            Get notified when someone follows you
          </p>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  );
}

function TwoFactorSettings() {
  return (
    <EmptyState
      icon="🔐"
      title="Two-factor authentication"
      description="Add an extra layer of security to your account"
    >
      <Button variant="primary">Enable two-factor</Button>
    </EmptyState>
  );
}

const tabComponents: Record<string, React.ReactNode> = {
  profile: <ProfileSettings />,
  account: <AccountSettings />,
  privacy: <PrivacySettings />,
  notifications: <NotificationSettings />,
  'two-factor': <TwoFactorSettings />,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>
      <Tabs
        tabs={settingTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Card className="mt-6 p-6">{tabComponents[activeTab]}</Card>
    </div>
  );
}
