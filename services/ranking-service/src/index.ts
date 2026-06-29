import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { rankingRouter } from './routes/ranking.routes';
import { updateAllRankings } from './services/rank-calculator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4351;

app.use(cors());
app.use(express.json());

app.use('/api/rankings', rankingRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ranking-service', timestamp: new Date().toISOString() });
});

cron.schedule('0 */6 * * *', async () => {
  console.log('[Ranking] Running scheduled ranking update...');
  try {
    await updateAllRankings();
    console.log('[Ranking] Scheduled update completed');
  } catch (error) {
    console.error('[Ranking] Scheduled update failed:', error);
  }
});

app.listen(PORT, () => {
  console.log(`[Ranking Service] Running on port ${PORT}`);
});

export default app;
