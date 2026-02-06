import { Game } from '../hooks/useGames';
import GameCard from './GameCard';

interface UpcomingListProps {
  games: Game[];
  isFullView?: boolean;
}

export default function UpcomingList({ games, isFullView = false }: UpcomingListProps) {
  if (games.length === 0) {
    return (
      <div className="upcoming-content">
        <div className="empty-state">
          <div className="empty-icon">-</div>
          <div>No upcoming games</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`upcoming-content ${isFullView ? 'full-view-grid' : ''}`}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
