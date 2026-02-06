import { Router, Request, Response } from 'express';
import { getGames } from '../services/scheduler';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const games = await getGames();
    res.json(games);
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({
      error: 'Failed to fetch games',
      live: [],
      upcoming: [],
      lastUpdated: new Date().toISOString()
    });
  }
});

export default router;
