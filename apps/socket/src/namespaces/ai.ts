import { Namespace } from 'socket.io';
import { AuthenticatedSocket } from '../auth';

interface FameScoreUpdate {
  userId: string;
  username: string;
  oldScore: number;
  newScore: number;
  delta: number;
  reason: string;
  timestamp?: number;
}

interface ViralPrediction {
  userId: string;
  username: string;
  predictionId: string;
  predictedScore: number;
  confidence: number;
  factors: string[];
  timestamp?: number;
}

export function registerAINamespace(io: Namespace): void {
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[AI] User ${socket.userId} connected`);

    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);

    socket.on(
      'fame:score-update',
      (data: FameScoreUpdate) => {
        try {
          if (!data.userId || data.oldScore === undefined || data.newScore === undefined) return;

          const update: FameScoreUpdate = {
            ...data,
            timestamp: data.timestamp || Date.now(),
          };

          io.emit('fame:score-update', update);
        } catch (error) {
          console.error(`[AI] Error broadcasting score update:`, error);
        }
      }
    );

    socket.on(
      'viral:prediction',
      (data: ViralPrediction) => {
        try {
          if (!data.userId || !data.predictionId) return;

          const prediction: ViralPrediction = {
            ...data,
            timestamp: data.timestamp || Date.now(),
          };

          socket.to(userRoom).emit('viral:prediction', prediction);
        } catch (error) {
          console.error(`[AI] Error broadcasting prediction:`, error);
        }
      }
    );

    socket.on('disconnect', () => {
      console.log(`[AI] User ${socket.userId} disconnected`);
    });
  });
}
