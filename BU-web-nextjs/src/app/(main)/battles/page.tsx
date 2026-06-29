'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';

const BattleCard = dynamic(
  () =>
    import('@/components/battle/battle-card').then((m) => m.BattleCard),
  {
    loading: () => <Spinner size="sm" />,
  },
);

const BattleCreateModal = dynamic(
  () =>
    import('@/components/battle/battle-create-modal').then(
      (m) => m.BattleCreateModal,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

const LeaderboardTable = dynamic(
  () =>
    import('@/components/battle/leaderboard-table').then(
      (m) => m.LeaderboardTable,
    ),
  {
    loading: () => <Spinner size="sm" />,
  },
);

const activeBattles = Array.from({ length: 6 }, (_, i) => ({
  id: `battle-${i}`,
}));

export default function BattlesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Battles</h1>
        <BattleCreateModal />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Active battles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeBattles.map((battle) => (
            <BattleCard key={battle.id} battleId={battle.id} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Leaderboard</h2>
        <Card className="p-4">
          <LeaderboardTable />
        </Card>
      </section>
    </div>
  );
}
