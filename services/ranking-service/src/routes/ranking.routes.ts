import { Router, Request, Response } from 'express';
import { getRanking, getUserRank, updateAllRankings, RankCategory } from '../services/rank-calculator';
import { getLeaderboard } from '../services/leaderboard';

export const rankingRouter = Router();

rankingRouter.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const limit = parseInt(req.query.limit as string || '50', 10);
    const result = await getLeaderboard(userId, Math.min(limit, 200));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch leaderboard' });
  }
});

rankingRouter.get('/:category', async (req: Request, res: Response) => {
  try {
    const category = req.params.category as RankCategory;
    if (!['global', 'country', 'city', 'college', 'category'].includes(category)) {
      res.status(400).json({ success: false, error: `Invalid category: ${category}` });
      return;
    }

    const qualifier = req.query.qualifier as string | undefined;
    const limit = parseInt(req.query.limit as string || '50', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const result = await getRanking(category, qualifier, Math.min(limit, 200), offset);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch ranking' });
  }
});

rankingRouter.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as RankCategory) || 'global';
    const qualifier = req.query.qualifier as string | undefined;

    const result = await getUserRank(req.params.userId, category, qualifier);
    if (!result) {
      res.status(404).json({ success: false, error: 'User not found in rankings' });
      return;
    }

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch user rank' });
  }
});

rankingRouter.post('/update', async (_req: Request, res: Response) => {
  try {
    await updateAllRankings();
    res.json({ success: true, message: 'Rankings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update rankings' });
  }
});
