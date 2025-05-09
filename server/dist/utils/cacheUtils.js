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
exports.createCacheUtils = void 0;
const cacheDuration = 3600;
const createCacheUtils = (redisClient) => ({
    getFromCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedData = yield redisClient.get(key);
            return cachedData ? JSON.parse(cachedData) : null;
        });
    },
    setInCache(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redisClient.setex(key, cacheDuration, JSON.stringify(data));
        });
    },
    clearAllCache() {
        return __awaiter(this, void 0, void 0, function* () {
            yield redisClient.flushdb();
        });
    },
    deleteCacheByKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redisClient.del(key);
        });
    }
});
exports.createCacheUtils = createCacheUtils;
