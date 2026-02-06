import { SportConfig } from '../config/sports';

export interface ESPNResponse {
  events?: ESPNEvent[];
  leagues?: Array<{
    name: string;
    abbreviation: string;
  }>;
}

export interface ESPNEvent {
  id: string;
  name: string;
  date: string;
  status: {
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
    };
    displayClock?: string;
    period?: number;
  };
  competitions?: Array<{
    id: string;
    competitors?: Array<{
      id: string;
      team?: {
        id: string;
        name: string;
        abbreviation: string;
        logo?: string;
      };
      athlete?: {
        fullName: string;
        shortName: string;
      };
      score?: string;
      homeAway?: string;
    }>;
    broadcasts?: Array<{
      names?: string[];
    }>;
    status?: {
      displayClock?: string;
      type?: {
        detail?: string;
      };
    };
  }>;
}

function getDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

async function fetchForDate(endpoint: string, dateStr: string): Promise<ESPNEvent[]> {
  try {
    const url = `${endpoint}?dates=${dateStr}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SportKiosk/1.0'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as ESPNResponse;
    return data.events || [];
  } catch {
    return [];
  }
}

export async function fetchSportData(config: SportConfig): Promise<ESPNResponse | null> {
  try {
    // Fetch today's games first
    const todayStr = getDateString(0);
    const todayEvents = await fetchForDate(config.endpoint, todayStr);

    // Check if there are any live or upcoming games today
    const hasActiveGamesToday = todayEvents.some(
      e => e.status.type.state === 'in' || e.status.type.state === 'pre'
    );

    let allEvents = todayEvents;

    // If no active games today, also fetch tomorrow
    if (!hasActiveGamesToday) {
      const tomorrowStr = getDateString(1);
      const tomorrowEvents = await fetchForDate(config.endpoint, tomorrowStr);

      // Combine and dedupe
      const eventMap = new Map<string, ESPNEvent>();
      for (const event of [...todayEvents, ...tomorrowEvents]) {
        eventMap.set(event.id, event);
      }
      allEvents = Array.from(eventMap.values());
    }

    console.log(`${config.id}: fetched ${allEvents.length} events`);
    return { events: allEvents };
  } catch (err) {
    console.error(`Error fetching ${config.id}:`, err);
    return null;
  }
}
