import Redis from 'ioredis';

class CacheService {
  private client: Redis | null = null;
  private memoryStore: Map<string, { value: string; expiresAt: number }> = new Map();
  private isRedisConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 2) {
            return null; // Stop retrying after 2 attempts and fall back to memory store
          }
          return 1000;
        },
      });

      this.client.connect().then(() => {
        this.isRedisConnected = true;
        console.log('✅ Connected to Redis successfully');
      }).catch((_err) => {
        this.isRedisConnected = false;
        console.log('ℹ️ Redis not running locally - using fast in-memory cache fallback');
      });

      this.client.on('error', (_err) => {
        this.isRedisConnected = false;
      });
    } catch (_e) {
      this.isRedisConnected = false;
      console.log('ℹ️ Using in-memory cache fallback');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (_e) {
        // Fallback to memory
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (_e) {
        // Fallback to memory
      }
    }

    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (_e) {
        // Fallback to memory
      }
    }
    this.memoryStore.delete(key);
  }

  async flush(): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.flushall();
      } catch (_e) {
        // Ignore
      }
    }
    this.memoryStore.clear();
  }
}

export const cacheService = new CacheService();
