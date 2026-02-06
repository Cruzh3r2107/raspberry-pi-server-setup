import { Game } from '../hooks/useGames';
import LiveGamePanel from './LiveGamePanel';
import UpcomingList from './UpcomingList';

interface SplitViewProps {
  liveGames: Game[];
  upcomingGames: Game[];
}

export default function SplitView({ liveGames, upcomingGames }: SplitViewProps) {
  return (
    <div className="split-view">
      <div className="live-panel">
        <LiveGamePanel games={liveGames} />
      </div>
      <div className="upcoming-panel">
        <div className="panel-header">
          <h2 className="panel-title">Upcoming</h2>
        </div>
        <UpcomingList games={upcomingGames} />
      </div>
    </div>
  );
}
