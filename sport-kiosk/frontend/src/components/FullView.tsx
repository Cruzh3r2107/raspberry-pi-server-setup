import { Game } from '../hooks/useGames';
import UpcomingList from './UpcomingList';

interface FullViewProps {
  upcomingGames: Game[];
}

export default function FullView({ upcomingGames }: FullViewProps) {
  return (
    <div className="full-view">
      <div className="panel-header">
        <h2 className="panel-title">Upcoming Games</h2>
      </div>
      <UpcomingList games={upcomingGames} isFullView />
    </div>
  );
}
