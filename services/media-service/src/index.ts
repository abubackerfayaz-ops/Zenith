import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mediaRouter } from './routes/media.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4352;

app.use(cors());
app.use(express.json());

app.use('/api/media', mediaRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'media-service', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Media Service] Running on port ${PORT}`);
});

export default app;
