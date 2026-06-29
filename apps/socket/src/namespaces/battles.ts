import { Namespace } from 'socket.io';
import { AuthenticatedSocket } from '../auth';

interface VoteUpdate {
  battleId: string;
  optionId: string;
  voteCount: number;
  totalVotes: number;
  userId?: string;
}

interface BattleStatus {
  battleId: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  winnerId?: string;
  endedAt?: number;
}

export function registerBattlesNamespace(io: Namespace): void {
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Battles] User ${socket.userId} connected`);

    socket.on('join:battle', (battleId: string) => {
      if (typeof battleId !== 'string' || !battleId.trim()) return;

      socket.join(`battle:${battleId}`);
      console.log(`[Battles] User ${socket.userId} joined battle ${battleId}`);
    });

    socket.on('leave:battle', (battleId: string) => {
      if (typeof battleId !== 'string' || !battleId.trim()) return;

      socket.leave(`battle:${battleId}`);
      console.log(`[Battles] User ${socket.userId} left battle ${battleId}`);
    });

    socket.on(
      'vote:update',
      (data: VoteUpdate) => {
        try {
          if (!data.battleId || !data.optionId) return;

          const voteData: VoteUpdate = {
            battleId: data.battleId,
            optionId: data.optionId,
            voteCount: data.voteCount,
            totalVotes: data.totalVotes,
          };

          socket.to(`battle:${data.battleId}`).emit('vote:update', voteData);
        } catch (error) {
          console.error(`[Battles] Error broadcasting vote update:`, error);
        }
      }
    );

    socket.on(
      'battle:status',
      (data: BattleStatus) => {
        try {
          if (!data.battleId || !data.status) return;

          io.to(`battle:${data.battleId}`).emit('battle:status', {
            battleId: data.battleId,
            status: data.status,
            winnerId: data.winnerId,
            endedAt: data.endedAt || Date.now(),
          });
        } catch (error) {
          console.error(`[Battles] Error broadcasting battle status:`, error);
        }
      }
    );

    socket.on('disconnect', () => {
      console.log(`[Battles] User ${socket.userId} disconnected`);
    });
  });
}
