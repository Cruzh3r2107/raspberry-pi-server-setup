import { Game } from '../hooks/useGames';
import { useRotation } from '../hooks/useRotation';
import { useRef, TouchEvent } from 'react';

interface LiveGamePanelProps {
  games: Game[];
}

const SPORT_LABELS: Record<string, string> = {
  nba: 'NBA',
  nfl: 'NFL',
  mlb: 'MLB',
  f1: 'Formula 1',
  ufc: 'UFC',
  cricket: 'Cricket',
  tennis: 'Tennis'
};

const SWIPE_THRESHOLD = 50; // minimum px to trigger swipe

export default function LiveGamePanel({ games }: LiveGamePanelProps) {
  const { current: game, index, next, prev, total } = useRotation(games);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // Swiped left - go to next
        next();
      } else {
        // Swiped right - go to previous
        prev();
      }
    }

    touchStartX.current = null;
  };

  if (!game) {
    return (
      <div className="empty-state">
        <div className="empty-icon">-</div>
        <div>No live games</div>
      </div>
    );
  }

  const [team1, team2] = game.competitors;

  return (
    <>
      <div className="panel-header">
        <h2 className="panel-title">Live Now</h2>
        <div className="live-indicator">
          <span className="live-dot" />
          LIVE
        </div>
        {total > 1 && (
          <div className="live-count">{index + 1} / {total}</div>
        )}
      </div>
      <div
        className="live-game-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="live-game-sport">
          {SPORT_LABELS[game.sport] || game.sport.toUpperCase()}
        </div>

        <div className="live-game-matchup">
          <div className="live-team">
            {team1?.logo ? (
              <img src={team1.logo} alt={team1.name} className="team-logo" />
            ) : (
              <div className="team-logo-placeholder">
                {team1?.shortName || '?'}
              </div>
            )}
            <div className="team-name">{team1?.name || 'TBD'}</div>
            <div className="team-short">{team1?.shortName}</div>
          </div>

          <div className="live-scores">
            <div className="live-score">{team1?.score ?? '-'}</div>
            <div className="score-divider">-</div>
            <div className="live-score">{team2?.score ?? '-'}</div>
          </div>

          <div className="live-team">
            {team2?.logo ? (
              <img src={team2.logo} alt={team2.name} className="team-logo" />
            ) : (
              <div className="team-logo-placeholder">
                {team2?.shortName || '?'}
              </div>
            )}
            <div className="team-name">{team2?.name || 'TBD'}</div>
            <div className="team-short">{team2?.shortName}</div>
          </div>
        </div>

        {game.clock && (
          <div className="live-clock">{game.clock.displayValue}</div>
        )}

        {game.broadcast && (
          <div className="live-broadcast">Watch on {game.broadcast}</div>
        )}

        {games.length > 1 && (
          <div className="rotation-indicator">
            {games.map((_, i) => (
              <div
                key={i}
                className={`rotation-dot ${i === index ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
