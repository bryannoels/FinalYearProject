"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cacheUtils_1 = require("../../../../src/utils/cacheUtils");
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
const cacheUtils = (0, cacheUtils_1.createCacheUtils)(mockRedisClient);
describe('cacheUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should get data from cache', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = 'testKey';
        const value = { some: 'data' };
        mockGet.mockResolvedValueOnce(JSON.stringify(value));
        const result = yield cacheUtils.getFromCache(key);
        expect(mockGet).toHaveBeenCalledWith(key);
        expect(result).toEqual(value);
    }));
    it('should return null if no data in cache', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = 'testKey';
        mockGet.mockResolvedValueOnce(null);
        const result = yield cacheUtils.getFromCache(key);
        expect(mockGet).toHaveBeenCalledWith(key);
        expect(result).toBeNull();
    }));
    it('should set data in cache', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = 'testKey';
        const data = { some: 'data' };
        yield cacheUtils.setInCache(key, data);
        expect(mockSetex).toHaveBeenCalledWith(key, 3600, JSON.stringify(data));
    }));
    it('should clear all cache', () => __awaiter(void 0, void 0, void 0, function* () {
        mockFlushdb.mockResolvedValueOnce('OK');
        yield cacheUtils.clearAllCache();
        expect(mockFlushdb).toHaveBeenCalledTimes(1);
    }));
    it('should delete cache by key', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = 'testKey';
        mockDel.mockResolvedValueOnce(1);
        yield cacheUtils.deleteCacheByKey(key);
        expect(mockDel).toHaveBeenCalledWith(key);
    }));
});
