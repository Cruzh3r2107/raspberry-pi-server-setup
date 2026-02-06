import { useState, useEffect, useCallback } from 'react';

export interface Competitor {
  name: string;
  shortName: string;
  logo?: string;
  score: string | number;
  isHome?: boolean;
}

export interface Game {
  id: string;
  sport: 'nba' | 'nfl' | 'mlb' | 'f1' | 'ufc' | 'cricket' | 'tennis';
  status: 'scheduled' | 'live' | 'final';
  startTime: string;
  name: string;
  competitors: Competitor[];
  clock?: { displayValue: string };
  broadcast?: string;
}

interface GamesState {
  live: Game[];
  upcoming: Game[];
}

interface UseGamesResult {
  games: GamesState;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

const POLL_INTERVAL = 30000; // 30 seconds

export function useGames(): UseGamesResult {
  const [games, setGames] = useState<GamesState>({ live: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setGames({ live: data.live || [], upcoming: data.upcoming || [] });
      setLastUpdated(data.lastUpdated || new Date().toISOString());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch games:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();

    const interval = setInterval(fetchGames, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchGames]);

  return { games, loading, error, lastUpdated, refresh: fetchGames };
}
