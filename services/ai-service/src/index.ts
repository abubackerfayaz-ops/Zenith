import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiRouter } from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4350;

app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[AI Service] Running on port ${PORT}`);
});

export default app;
