import { createCacheUtils } from '../../../../src/utils/cacheUtils';

const mockGet = jest.fn();
const mockSetex = jest.fn();
const mockFlushdb = jest.fn();
const mockDel = jest.fn();


const mockRedisClient = {
  get: mockGet,
  setex: mockSetex,
  flushdb: mockFlushdb,
  del: mockDel
};

const cacheUtils = createCacheUtils(mockRedisClient as any);

describe('cacheUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get data from cache', async () => {
    const key = 'testKey';
    const value = { some: 'data' };

    mockGet.mockResolvedValueOnce(JSON.stringify(value));

    const result = await cacheUtils.getFromCache(key);

    expect(mockGet).toHaveBeenCalledWith(key);
    expect(result).toEqual(value);
  });

  it('should return null if no data in cache', async () => {
    const key = 'testKey';

    mockGet.mockResolvedValueOnce(null);

    const result = await cacheUtils.getFromCache(key);

    expect(mockGet).toHaveBeenCalledWith(key);
    expect(result).toBeNull();
  });

  it('should set data in cache', async () => {
    const key = 'testKey';
    const data = { some: 'data' };

    await cacheUtils.setInCache(key, data);

    expect(mockSetex).toHaveBeenCalledWith(key, 3600, JSON.stringify(data));
  });

  it('should clear all cache', async () => {
    mockFlushdb.mockResolvedValueOnce('OK');

    await cacheUtils.clearAllCache();

    expect(mockFlushdb).toHaveBeenCalledTimes(1);
  });

  it('should delete cache by key', async () => {
    const key = 'testKey';
    mockDel.mockResolvedValueOnce(1);

    await cacheUtils.deleteCacheByKey(key);

    expect(mockDel).toHaveBeenCalledWith(key);
  });
});
