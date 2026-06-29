'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { LeaderboardTable } from '@/components/battle/leaderboard-table';

const tabs = [
  { id: 'world', label: 'World' },
  { id: 'country', label: 'Country' },
  { id: 'city', label: 'City' },
  { id: 'college', label: 'College' },
  { id: 'category', label: 'Category' },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('world');

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          Global rankings across FameWars
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <Card className="mt-6 p-4">
        <LeaderboardTable scope={activeTab} />
      </Card>
    </div>
  );
}
