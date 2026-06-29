import { Router, Request, Response } from 'express';
import { getFameScore, recalculateFameScore } from '../services/fame-score';
import { predictViralPotential } from '../services/viral-predictor';
import { analyzePersonality } from '../services/personality-analyzer';
import { getContentSuggestions, getTrendingTopicsPublic } from '../services/content-suggestions';

export const aiRouter = Router();

aiRouter.get('/fame-score/:userId', async (req: Request, res: Response) => {
  try {
    const result = await getFameScore(req.params.userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to calculate fame score' });
  }
});

aiRouter.post('/fame-score/:userId/recalculate', async (req: Request, res: Response) => {
  try {
    const result = await recalculateFameScore(req.params.userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to recalculate fame score' });
  }
});

aiRouter.post('/viral-predict', (req: Request, res: Response) => {
  try {
    const result = predictViralPotential(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to predict viral potential' });
  }
});

aiRouter.post('/personality-analyze', (req: Request, res: Response) => {
  try {
    const result = analyzePersonality(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to analyze personality' });
  }
});

aiRouter.post('/content-suggestions', async (req: Request, res: Response) => {
  try {
    const result = await getContentSuggestions(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to generate suggestions' });
  }
});

aiRouter.get('/trending', (req: Request, res: Response) => {
  try {
    const niche = req.query.niche as string | undefined;
    const topics = getTrendingTopicsPublic(niche);
    res.json({ success: true, data: topics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch trending topics' });
  }
});
