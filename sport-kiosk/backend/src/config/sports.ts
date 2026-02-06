import { SportType } from '../types/game';

export interface SportConfig {
  id: SportType;
  name: string;
  endpoint: string;
  cacheTTL: {
    live: number;
    schedule: number;
  };
}

export const SPORTS: SportConfig[] = [
  {
    id: 'nba',
    name: 'NBA',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    cacheTTL: { live: 30, schedule: 300 }
  },
  {
    id: 'nfl',
    name: 'NFL',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    cacheTTL: { live: 30, schedule: 300 }
  },
  {
    id: 'mlb',
    name: 'MLB',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
    cacheTTL: { live: 30, schedule: 300 }
  },
  {
    id: 'f1',
    name: 'Formula 1',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard',
    cacheTTL: { live: 30, schedule: 900 }
  },
  {
    id: 'ufc',
    name: 'UFC',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard',
    cacheTTL: { live: 30, schedule: 900 }
  },
  {
    id: 'cricket',
    name: 'Cricket',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/cricket/scoreboard',
    cacheTTL: { live: 30, schedule: 600 }
  },
  {
    id: 'tennis',
    name: 'Tennis',
    endpoint: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard',
    cacheTTL: { live: 30, schedule: 600 }
  }
];

export const getSportConfig = (sport: SportType): SportConfig | undefined => {
  return SPORTS.find(s => s.id === sport);
};
