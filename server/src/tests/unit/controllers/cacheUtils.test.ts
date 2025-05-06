import Redis from 'ioredis';
import { cacheUtils } from '../../../../src/utils/cacheUtils';

jest.mock('ioredis');

describe('cacheUtils', () => {
  let redis: jest.Mocked<Redis>;

  beforeEach(() => {
    redis = new Redis() as jest.Mocked<Redis>;
  });

  it('should get data from cache', async () => {
    const key = 'testKey';
    const value = { some: 'data' };

    redis.get.mockResolvedValueOnce(JSON.stringify(value));

    const result = await cacheUtils.getFromCache(key);

    expect(redis.get).toHaveBeenCalledWith(key);
    expect(result).toEqual(value);
  });

  it('should return null if no data in cache', async () => {
    const key = 'testKey';

    redis.get.mockResolvedValueOnce(null);

    const result = await cacheUtils.getFromCache(key);

    expect(redis.get).toHaveBeenCalledWith(key);
    expect(result).toBeNull();
  });

  it('should set data in cache', async () => {
    const key = 'testKey';
    const data = { some: 'data' };

    await cacheUtils.setInCache(key, data);

    expect(redis.setex).toHaveBeenCalledWith(key, 3600, JSON.stringify(data));
  });
});
