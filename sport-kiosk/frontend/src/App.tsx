import { useGames } from './hooks/useGames';
import KioskLayout from './components/KioskLayout';

function App() {
  const { games, loading, error, lastUpdated } = useGames();

  return (
    <div className="kiosk-container">
      <header className="kiosk-header">
        <h1 className="kiosk-title">Sports Kiosk</h1>
        <div style={{ textAlign: 'right' }}>
          <CurrentTime />
          {lastUpdated && (
            <div className="last-updated">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </header>
      <main className="kiosk-main">
        <KioskLayout
          liveGames={games.live}
          upcomingGames={games.upcoming}
          loading={loading}
          error={error}
        />
      </main>
    </div>
  );
}

function CurrentTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Chicago'
  });
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Chicago'
  });

  return (
    <div className="kiosk-time">
      {dateStr} &bull; {timeStr}
    </div>
  );
}

export default App;
