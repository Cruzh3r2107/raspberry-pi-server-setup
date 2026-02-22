# Sport Kiosk

A full-stack sports kiosk displaying live scores and upcoming games for multiple sports. Optimized for tablet landscape viewing with a 60/40 split-screen layout when live games are active.

**Source Code:** https://github.com/Cruzh3r2107/sport-kiosk

## Features

- **Live Score Display**: Large score panel with auto-rotation every 30s for multiple live games
- **Upcoming Games**: Shows today's and tomorrow's scheduled games
- **Multi-Sport Support**: NBA, NFL, MLB, F1, UFC, Cricket, Tennis
- **Dark Theme**: Optimized for ambient viewing
- **Tablet Optimized**: Touch-friendly, no scroll bounce, landscape layout

## Architecture

```
Tablet Browser (landscape)
    ↓
Nginx (port 3000) → serves React frontend + proxies /api
    ↓
Node.js Backend (port 3001) → polls ESPN API, transforms data
    ↓
Redis Cache → stores responses (30s-15min TTL per sport)
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- SSD mounted at `/mnt/storage`

### Deploy

```bash
# Create storage directory
sudo mkdir -p /mnt/storage/sport-kiosk/redis
sudo chown -R 1000:1000 /mnt/storage/sport-kiosk

# Start services
cd ~/raspberry-pi-server-setup/sport-kiosk
docker compose up -d

# View logs
docker logs -f sport-kiosk-backend
```

### Access

| Interface | URL |
|-----------|-----|
| Local | http://<local-ip>:3000 |
| Tailscale | http://<tailscale-ip>:3000 |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check with Redis status |
| `GET /api/games` | Returns `{ live: Game[], upcoming: Game[], lastUpdated: string }` |

### Game Object

```typescript
interface Game {
  id: string;
  sport: 'nba' | 'nfl' | 'mlb' | 'f1' | 'ufc' | 'cricket' | 'tennis';
  status: 'scheduled' | 'live' | 'final';
  startTime: string;          // ISO 8601
  name: string;               // "Lakers vs Celtics"
  competitors: Array<{
    name: string;
    shortName: string;        // "LAL"
    logo?: string;
    score: string | number;
    isHome?: boolean;
  }>;
  clock?: {
    displayValue: string;     // "Q3 5:42", "Lap 45"
  };
  broadcast?: string;         // "ESPN"
}
```

## Sports Coverage

| Sport | ESPN Endpoint | Cache TTL |
|-------|--------------|-----------|
| NBA | basketball/nba/scoreboard | 30s live, 5min schedule |
| NFL | football/nfl/scoreboard | 30s live, 5min schedule |
| MLB | baseball/mlb/scoreboard | 30s live, 5min schedule |
| F1 | racing/f1/scoreboard | 30s live, 15min schedule |
| UFC | mma/ufc/scoreboard | 30s live, 15min schedule |
| Cricket | cricket/scoreboard | 30s live, 10min schedule |
| Tennis | tennis/atp/scoreboard | 30s live, 10min schedule |

## Display Modes

### Split View (Live Games Active)
- **Left Panel (60%)**: Current live game with large scores
- **Right Panel (40%)**: Scrollable list of upcoming games
- Auto-rotates between live games every 30 seconds

### Full View (No Live Games)
- Grid layout of all upcoming games
- Responsive columns based on screen width

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TZ` | America/Chicago | Timezone for scheduling |
| `REDIS_HOST` | sport-kiosk-redis | Redis hostname |
| `REDIS_PORT` | 6379 | Redis port |
| `PORT` | 3001 | Backend API port |

## Storage

| Purpose | Path |
|---------|------|
| Redis persistence | `/mnt/storage/sport-kiosk/redis/` |
| Source code | `~/raspberry-pi-server-setup/sport-kiosk/` |

## Commands

### Service Management

```bash
# Start
cd ~/raspberry-pi-server-setup/sport-kiosk && docker compose up -d

# Stop
cd ~/raspberry-pi-server-setup/sport-kiosk && docker compose down

# Restart
cd ~/raspberry-pi-server-setup/sport-kiosk && docker compose restart

# Rebuild after code changes
cd ~/raspberry-pi-server-setup/sport-kiosk && docker compose up -d --build
```

### Monitoring

```bash
# View logs
docker logs sport-kiosk-backend
docker logs sport-kiosk-frontend
docker logs sport-kiosk-redis

# Follow logs
docker logs -f sport-kiosk-backend

# Check container status
docker ps | grep sport-kiosk

# Resource usage
docker stats sport-kiosk-backend sport-kiosk-frontend sport-kiosk-redis
```

### Testing

```bash
# Health check
curl http://localhost:3000/api/health | jq

# Games endpoint
curl http://localhost:3000/api/games | jq
```

## Troubleshooting

### No games appearing
1. Check backend logs: `docker logs sport-kiosk-backend`
2. Verify Redis connection: `curl http://localhost:3000/api/health`
3. Check if ESPN API is accessible from the container

### High CPU usage
- Normal: 5-10% during polling
- If consistently high, check for excessive API calls in logs

### Frontend not loading
1. Check nginx logs: `docker logs sport-kiosk-frontend`
2. Verify backend is running and healthy
3. Check browser console for errors

### Redis connection failed
1. Check Redis container: `docker ps | grep redis`
2. Restart Redis: `docker restart sport-kiosk-redis`
3. Check volume permissions: `ls -la /mnt/storage/sport-kiosk/redis`

## Tablet Setup

### Recommended Settings

1. Open Safari/Chrome on tablet
2. Navigate to http://<local-ip>:3000
3. Lock screen to landscape orientation
4. Add to Home Screen for fullscreen experience
5. Enable "Guided Access" (iOS) or "Pin App" (Android) for kiosk mode

### Optimal Display

- Screen: 10" or larger tablet
- Orientation: Landscape
- Brightness: 50-70% for ambient viewing
- Auto-lock: Disabled or extended

## Development

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Project Structure

```
sport-kiosk/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts              # Express server
│       ├── config/sports.ts      # Sport definitions
│       ├── routes/
│       │   ├── games.ts          # /api/games endpoint
│       │   └── health.ts         # Health check
│       ├── services/
│       │   ├── espn.ts           # ESPN API client
│       │   ├── cache.ts          # Redis cache
│       │   └── scheduler.ts      # Polling scheduler
│       ├── transformers/index.ts # ESPN → unified model
│       └── types/game.ts         # TypeScript interfaces
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── hooks/
        │   ├── useGames.ts       # API polling hook
        │   └── useRotation.ts    # Live game rotation
        ├── components/
        │   ├── KioskLayout.tsx   # Layout switcher
        │   ├── SplitView.tsx     # 60/40 split
        │   ├── FullView.tsx      # Full screen
        │   ├── LiveGamePanel.tsx # Large score display
        │   ├── UpcomingList.tsx  # Game list
        │   └── GameCard.tsx      # Individual game
        └── styles/kiosk.css      # Dark theme
```

## Performance

| Container | Idle CPU | Idle RAM |
|-----------|----------|----------|
| Backend | 1-5% | 50-80MB |
| Frontend (Nginx) | <1% | 10-20MB |
| Redis | <1% | 10-20MB |

Polling frequency:
- Live games active: Every 30 seconds
- No live games: Every 5 minutes
