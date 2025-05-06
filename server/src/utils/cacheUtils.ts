import Redis from 'ioredis'; // or wherever you initialized it

const redis = new Redis();
const cacheDuration = 3600;

export const cacheUtils = {
  async getFromCache(key: string): Promise<any | null> {
    console.log(`Fetching from cache with key: ${key}`);
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  },

  async setInCache(key: string, data: any): Promise<void> {
    await redis.setex(key, cacheDuration, JSON.stringify(data));
  }
};
