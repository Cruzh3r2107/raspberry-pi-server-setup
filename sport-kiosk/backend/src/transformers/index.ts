import { Game, GameStatus, SportType, Competitor } from '../types/game';
import { ESPNEvent, ESPNResponse } from '../services/espn';

function mapStatus(state: string, completed: boolean): GameStatus {
  if (completed) return 'final';
  if (state === 'in') return 'live';
  return 'scheduled';
}

function extractCompetitors(event: ESPNEvent, sport: SportType): Competitor[] {
  const competition = event.competitions?.[0];
  if (!competition?.competitors) {
    return [];
  }

  return competition.competitors.map(comp => {
    // For individual sports like tennis/F1, use athlete name
    const name = comp.team?.name || comp.athlete?.fullName || 'TBD';
    const shortName = comp.team?.abbreviation || comp.athlete?.shortName || name.substring(0, 3).toUpperCase();

    return {
      name,
      shortName,
      logo: comp.team?.logo,
      score: comp.score || '0',
      isHome: comp.homeAway === 'home'
    };
  });
}

function extractClock(event: ESPNEvent): { displayValue: string } | undefined {
  const competition = event.competitions?.[0];
  const statusDetail = competition?.status?.type?.detail;
  const displayClock = event.status?.displayClock || competition?.status?.displayClock;
  const period = event.status?.period;

  // Use status detail if available (more descriptive)
  if (statusDetail) {
    return { displayValue: statusDetail };
  }

  // Fallback to clock + period
  if (displayClock) {
    if (period) {
      return { displayValue: `Q${period} ${displayClock}` };
    }
    return { displayValue: displayClock };
  }

  return undefined;
}

function extractBroadcast(event: ESPNEvent): string | undefined {
  const broadcasts = event.competitions?.[0]?.broadcasts;
  if (broadcasts && broadcasts.length > 0) {
    const names = broadcasts[0]?.names;
    if (names && names.length > 0) {
      return names[0];
    }
  }
  return undefined;
}

export function transformESPNResponse(response: ESPNResponse, sport: SportType): Game[] {
  if (!response.events) {
    return [];
  }

  return response.events.map(event => {
    const status = mapStatus(
      event.status?.type?.state || 'pre',
      event.status?.type?.completed || false
    );

    const game: Game = {
      id: `${sport}-${event.id}`,
      sport,
      status,
      startTime: event.date,
      name: event.name,
      competitors: extractCompetitors(event, sport)
    };

    // Only add clock for live games
    if (status === 'live') {
      const clock = extractClock(event);
      if (clock) {
        game.clock = clock;
      }
    }

    const broadcast = extractBroadcast(event);
    if (broadcast) {
      game.broadcast = broadcast;
    }

    return game;
  });
}

export function filterUpcoming(games: Game[]): Game[] {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + 7); // Show 7 days ahead
  futureDate.setHours(23, 59, 59, 999);

  return games
    .filter(game => {
      if (game.status !== 'scheduled') return false;
      const gameDate = new Date(game.startTime);
      return gameDate >= now && gameDate < futureDate;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export function filterLive(games: Game[]): Game[] {
  return games.filter(game => game.status === 'live');
}
