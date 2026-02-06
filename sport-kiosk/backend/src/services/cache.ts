import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

class CacheService {
  private client: Redis;
  private connected: boolean = false;

  constructor() {
    this.client = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      retryStrategy: (times) => {
        if (times > 10) {
          console.error('Redis connection failed after 10 retries');
          return null;
        }
        return Math.min(times * 100, 3000);
      }
    });

    this.client.on('connect', () => {
      this.connected = true;
      console.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err.message);
      this.connected = false;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      console.error('Cache set error:', err);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Cache delete error:', err);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const cache = new CacheService();
