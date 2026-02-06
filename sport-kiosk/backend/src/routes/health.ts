import { Router, Request, Response } from 'express';
import { cache } from '../services/cache';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    redis: cache.isConnected() ? 'connected' : 'disconnected',
    uptime: process.uptime()
  };

  const statusCode = cache.isConnected() ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
