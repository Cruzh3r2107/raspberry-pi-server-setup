import { Game } from '../hooks/useGames';
import SplitView from './SplitView';
import FullView from './FullView';

interface KioskLayoutProps {
  liveGames: Game[];
  upcomingGames: Game[];
  loading: boolean;
  error: string | null;
}

export default function KioskLayout({
  liveGames,
  upcomingGames,
  loading,
  error
}: KioskLayoutProps) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-text">Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div>Failed to load games</div>
        <div className="loading-text">{error}</div>
      </div>
    );
  }

  // If there are live games, show split view (60/40)
  if (liveGames.length > 0) {
    return <SplitView liveGames={liveGames} upcomingGames={upcomingGames} />;
  }

  // No live games - show full view of upcoming
  return <FullView upcomingGames={upcomingGames} />;
}
