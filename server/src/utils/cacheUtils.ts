import Redis from 'ioredis';

const cacheDuration = 3600;

export const createCacheUtils = (redisClient: Redis) => ({
  async getFromCache(key: string): Promise<any | null> {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  },

  async setInCache(key: string, data: any): Promise<void> {
    await redisClient.setex(key, cacheDuration, JSON.stringify(data));
  },

  async clearAllCache(): Promise<void> {
    await redisClient.flushdb();
  },

  async deleteCacheByKey(key: string): Promise<void> {
    await redisClient.del(key);
  }
});
