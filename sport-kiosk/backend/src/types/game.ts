export type SportType = 'nba' | 'nfl' | 'mlb' | 'f1' | 'ufc' | 'cricket' | 'tennis';

export type GameStatus = 'scheduled' | 'live' | 'final';

export interface Competitor {
  name: string;
  shortName: string;
  logo?: string;
  score: string | number;
  isHome?: boolean;
}

export interface GameClock {
  displayValue: string;
}

export interface Game {
  id: string;
  sport: SportType;
  status: GameStatus;
  startTime: string;
  name: string;
  competitors: Competitor[];
  clock?: GameClock;
  broadcast?: string;
}

export interface GamesResponse {
  live: Game[];
  upcoming: Game[];
  lastUpdated: string;
}
