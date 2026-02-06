import { SPORTS } from '../config/sports';
import { fetchSportData } from './espn';
import { cache } from './cache';
import { transformESPNResponse, filterLive, filterUpcoming } from '../transformers';
import { Game } from '../types/game';

let liveGamesActive = false;
let pollInterval: NodeJS.Timeout | null = null;

async function fetchAllSports(): Promise<{ live: Game[]; upcoming: Game[] }> {
  const allGames: Game[] = [];

  const results = await Promise.allSettled(
    SPORTS.map(async (sport) => {
      // Check cache first
      const cacheKey = `sport:${sport.id}`;
      const cached = await cache.get<Game[]>(cacheKey);

      if (cached) {
        return cached;
      }

      // Fetch from ESPN
      const data = await fetchSportData(sport);
      if (!data) {
        return [];
      }

      const games = transformESPNResponse(data, sport.id);

      // Cache with appropriate TTL
      const hasLive = games.some(g => g.status === 'live');
      const ttl = hasLive ? sport.cacheTTL.live : sport.cacheTTL.schedule;
      await cache.set(cacheKey, games, ttl);

      return games;
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allGames.push(...result.value);
    }
  }

  const live = filterLive(allGames);
  const upcoming = filterUpcoming(allGames);

  // Update live games status
  liveGamesActive = live.length > 0;

  return { live, upcoming };
}

export async function getGames(): Promise<{ live: Game[]; upcoming: Game[]; lastUpdated: string }> {
  const { live, upcoming } = await fetchAllSports();
  return {
    live,
    upcoming,
    lastUpdated: new Date().toISOString()
  };
}

export function startScheduler(): void {
  // Initial fetch
  fetchAllSports().catch(console.error);

  // Dynamic polling: 30s when live games, 5min otherwise
  const poll = async () => {
    await fetchAllSports().catch(console.error);

    // Clear existing interval
    if (pollInterval) {
      clearTimeout(pollInterval);
    }

    // Set next poll based on whether there are live games
    const nextPollMs = liveGamesActive ? 30000 : 300000;
    pollInterval = setTimeout(poll, nextPollMs);

    console.log(`Next poll in ${nextPollMs / 1000}s (live games: ${liveGamesActive})`);
  };

  // Start initial poll after 30s
  pollInterval = setTimeout(poll, 30000);
  console.log('Scheduler started');
}

export function stopScheduler(): void {
  if (pollInterval) {
    clearTimeout(pollInterval);
    pollInterval = null;
  }
  console.log('Scheduler stopped');
}
