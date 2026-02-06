import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import gamesRouter from './routes/games';
import { startScheduler, stopScheduler } from './services/scheduler';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/games', gamesRouter);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  stopScheduler();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  stopScheduler();
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sport Kiosk backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Games API: http://localhost:${PORT}/api/games`);

  // Start the scheduler
  startScheduler();
});
