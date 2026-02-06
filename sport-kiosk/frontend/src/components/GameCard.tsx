import { Game } from '../hooks/useGames';

interface GameCardProps {
  game: Game;
}

const SPORT_LABELS: Record<string, string> = {
  nba: 'NBA',
  nfl: 'NFL',
  mlb: 'MLB',
  f1: 'F1',
  ufc: 'UFC',
  cricket: 'Cricket',
  tennis: 'Tennis'
};

function formatGameTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Chicago'
  });

  if (isToday) {
    return `Today ${time}`;
  }
  if (isTomorrow) {
    return `Tomorrow ${time}`;
  }

  const dayStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Chicago'
  });
  return `${dayStr} ${time}`;
}

export default function GameCard({ game }: GameCardProps) {
  const [team1, team2] = game.competitors;

  return (
    <div className="game-card">
      <div className="game-card-header">
        <span className="game-sport-badge">
          {SPORT_LABELS[game.sport] || game.sport.toUpperCase()}
        </span>
        <span className="game-time">{formatGameTime(game.startTime)}</span>
      </div>
      <div className="game-card-teams">
        <div className="game-team">
          {team1?.logo ? (
            <img src={team1.logo} alt={team1.name} className="game-team-logo" />
          ) : (
            <div className="game-team-logo-placeholder">
              {team1?.shortName?.substring(0, 3) || '?'}
            </div>
          )}
          <span className="game-team-name">{team1?.name || 'TBD'}</span>
        </div>
        <span className="game-vs">vs</span>
        <div className="game-team away">
          {team2?.logo ? (
            <img src={team2.logo} alt={team2.name} className="game-team-logo" />
          ) : (
            <div className="game-team-logo-placeholder">
              {team2?.shortName?.substring(0, 3) || '?'}
            </div>
          )}
          <span className="game-team-name">{team2?.name || 'TBD'}</span>
        </div>
      </div>
      {game.broadcast && (
        <div className="game-broadcast">{game.broadcast}</div>
      )}
    </div>
  );
}
