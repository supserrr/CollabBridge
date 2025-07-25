"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
class CacheService {
    constructor() {
        this.memoryCache = new Map();
        this.defaultTTL = 300000; // 5 minutes in milliseconds
        this.maxMemoryEntries = 1000; // Limit memory cache size
        // Start cleanup interval to prevent memory leaks
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000); // Clean up every minute
    }
    // Clean up expired entries and enforce size limits
    cleanupExpired() {
        const now = Date.now();
        let removed = 0;
        // Remove expired entries
        for (const [key, entry] of this.memoryCache.entries()) {
            if (now > entry.expiry) {
                this.memoryCache.delete(key);
                removed++;
            }
        }
        // Enforce size limit (LRU-style)
        if (this.memoryCache.size > this.maxMemoryEntries) {
            const excess = this.memoryCache.size - this.maxMemoryEntries;
            const keysToRemove = Array.from(this.memoryCache.keys()).slice(0, excess);
            keysToRemove.forEach(key => this.memoryCache.delete(key));
            removed += excess;
        }
        if (removed > 0) {
            logger_1.logger.debug(`Memory cache cleanup: ${removed} entries removed`);
        }
    }
    async set(key, data, ttl = this.defaultTTL) {
        try {
            // Try Redis first if available
            if ((0, redis_1.isRedisAvailable)() && (0, redis_1.isRedisConnected)()) {
                const redisClient = (0, redis_1.getRedisClient)();
                if (redisClient) {
                    try {
                        const serialized = JSON.stringify(data);
                        await redisClient.setEx(key, Math.ceil(ttl / 1000), serialized);
                        logger_1.logger.debug(`Redis SET: ${key} (TTL: ${ttl}ms)`);
                        return;
                    }
                    catch (redisError) {
                        logger_1.logger.warn(`Redis SET failed for key ${key}, falling back to memory cache:`, redisError);
                    }
                }
            }
            // Fallback to memory cache
            this.memoryCache.set(key, {
                data,
                expiry: Date.now() + ttl
            });
            logger_1.logger.debug(`Memory Cache SET: ${key} (TTL: ${ttl}ms)`);
        }
        catch (error) {
            logger_1.logger.error('Cache set error:', error);
        }
    }
    async get(key) {
        try {
            // Try Redis first if available
            if ((0, redis_1.isRedisAvailable)() && (0, redis_1.isRedisConnected)()) {
                const redisClient = (0, redis_1.getRedisClient)();
                if (redisClient) {
                    try {
                        const cached = await redisClient.get(key);
                        if (cached) {
                            logger_1.logger.debug(`Redis HIT: ${key}`);
                            return JSON.parse(cached);
                        }
                        logger_1.logger.debug(`Redis MISS: ${key}`);
                    }
                    catch (redisError) {
                        logger_1.logger.warn(`Redis GET failed for key ${key}, falling back to memory cache:`, redisError);
                    }
                }
            }
            // Fallback to memory cache
            const cached = this.memoryCache.get(key);
            if (!cached) {
                logger_1.logger.debug(`Memory Cache MISS: ${key}`);
                return null;
            }
            if (Date.now() > cached.expiry) {
                this.memoryCache.delete(key);
                logger_1.logger.debug(`Memory Cache EXPIRED: ${key}`);
                return null;
            }
            logger_1.logger.debug(`Memory Cache HIT: ${key}`);
            return cached.data;
        }
        catch (error) {
            logger_1.logger.error('Cache get error:', error);
            return null;
        }
    }
    async delete(key) {
        try {
            let result = false;
            // Try Redis first if available
            if ((0, redis_1.isRedisAvailable)() && (0, redis_1.isRedisConnected)()) {
                const redisClient = (0, redis_1.getRedisClient)();
                if (redisClient) {
                    try {
                        const redisResult = await redisClient.del(key);
                        result = redisResult > 0;
                        if (result) {
                            logger_1.logger.debug(`Redis DELETE: ${key}`);
                        }
                    }
                    catch (redisError) {
                        logger_1.logger.warn(`Redis DELETE failed for key ${key}:`, redisError);
                    }
                }
            }
            // Also delete from memory cache
            const memoryResult = this.memoryCache.delete(key);
            if (memoryResult) {
                logger_1.logger.debug(`Memory Cache DELETE: ${key}`);
                result = true;
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Cache delete error:', error);
            return false;
        }
    }
    async deletePattern(pattern) {
        try {
            let deletedCount = 0;
            // Try Redis first if available
            if ((0, redis_1.isRedisAvailable)() && (0, redis_1.isRedisConnected)()) {
                const redisClient = (0, redis_1.getRedisClient)();
                if (redisClient) {
                    try {
                        const keys = await redisClient.keys(pattern);
                        if (keys.length > 0) {
                            deletedCount = await redisClient.del(keys);
                            logger_1.logger.debug(`Redis DELETE PATTERN: ${pattern} (${deletedCount} keys)`);
                        }
                    }
                    catch (redisError) {
                        logger_1.logger.warn(`Redis DELETE PATTERN failed for pattern ${pattern}:`, redisError);
                    }
                }
            }
            // Also check memory cache
            for (const key of this.memoryCache.keys()) {
                if (key.includes(pattern.replace('*', ''))) {
                    this.memoryCache.delete(key);
                    deletedCount++;
                }
            }
            return deletedCount;
        }
        catch (error) {
            logger_1.logger.error('Cache delete pattern error:', error);
            return 0;
        }
    }
    async clear() {
        try {
            // Clear Redis if available
            if ((0, redis_1.isRedisAvailable)() && (0, redis_1.isRedisConnected)()) {
                const redisClient = (0, redis_1.getRedisClient)();
                if (redisClient) {
                    try {
                        await redisClient.flushDb();
                        logger_1.logger.info('Redis cache cleared');
                    }
                    catch (redisError) {
                        logger_1.logger.warn('Redis cache clear failed:', redisError);
                    }
                }
            }
            // Clear memory cache
            const size = this.memoryCache.size;
            this.memoryCache.clear();
            logger_1.logger.info(`Memory cache cleared: ${size} entries removed`);
        }
        catch (error) {
            logger_1.logger.error('Cache clear error:', error);
        }
    }
    async getStats() {
        const stats = {
            memory: {
                size: this.memoryCache.size,
                keys: Array.from(this.memoryCache.keys())
            }
        };
        try {
            if ((0, redis_1.isRedisAvailable)() && (0, redis_1.isRedisConnected)()) {
                const redisClient = (0, redis_1.getRedisClient)();
                if (redisClient) {
                    try {
                        const info = await redisClient.info('memory');
                        const dbSize = await redisClient.dbSize();
                        stats.redis = {
                            connected: true,
                            available: true,
                            dbSize,
                            memory: info
                        };
                    }
                    catch (redisError) {
                        stats.redis = { connected: false, available: true, error: redisError };
                    }
                }
            }
            else {
                stats.redis = {
                    connected: false,
                    available: (0, redis_1.isRedisAvailable)(),
                    message: (0, redis_1.isRedisAvailable)() ? 'Redis available but not connected' : 'Redis not available in this environment'
                };
            }
        }
        catch (error) {
            logger_1.logger.error('Error getting Redis stats:', error);
            stats.redis = { connected: false, available: false, error: error };
        }
        return stats;
    }
    // Utility method to wrap database calls with caching
    async wrap(key, fetcher, ttl = this.defaultTTL) {
        let cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        try {
            const data = await fetcher();
            await this.set(key, data, ttl);
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Cache wrap error for key ${key}:`, error);
            throw error;
        }
    }
    // Invalidate cache for user-related data
    async invalidateusersCache(userId) {
        try {
            await Promise.all([
                this.delete(CacheService.KEYS.USER_PROFILE(userId)),
                this.delete(CacheService.KEYS.PROFESSIONAL_PROFILE(userId)),
                this.delete(CacheService.KEYS.USER_STATISTICS(userId)),
                this.deletePattern(`user:bookings:${userId}:*`),
            ]);
            logger_1.logger.debug(`Invalidated cache for user: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Error invalidating user cache:', error);
        }
    }
    // Invalidate cache for event-related data
    async invalidateEventCache(eventId) {
        try {
            await Promise.all([
                this.delete(CacheService.KEYS.EVENT_DETAILS(eventId)),
                this.delete(CacheService.KEYS.EVENT_APPLICATIONS(eventId)),
                this.deletePattern('events:list:*'),
                this.delete(CacheService.KEYS.POPULAR_EVENTS()),
            ]);
            logger_1.logger.debug(`Invalidated cache for event: ${eventId}`);
        }
        catch (error) {
            logger_1.logger.error('Error invalidating event cache:', error);
        }
    }
    // Clean up expired entries (memory cache only)
    cleanup() {
        try {
            const now = Date.now();
            let removed = 0;
            for (const [key, entry] of this.memoryCache.entries()) {
                if (now > entry.expiry) {
                    this.memoryCache.delete(key);
                    removed++;
                }
            }
            if (removed > 0) {
                logger_1.logger.info(`Memory cache cleanup: ${removed} expired entries removed`);
            }
        }
        catch (error) {
            logger_1.logger.error('Cache cleanup error:', error);
        }
    }
    // Start periodic cleanup
    startCleanupInterval(intervalMs = 600000) {
        return setInterval(() => {
            this.cleanup();
        }, intervalMs);
    }
    // Shutdown method to clean up resources
    shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.memoryCache.clear();
    }
}
exports.CacheService = CacheService;
// Cache keys for different data types
CacheService.KEYS = {
    USER_PROFILE: (userId) => `user:profile:${userId}`,
    USER_PROFILE_BY_USERNAME: (username) => `user:profile:username:${username}`,
    EVENT_DETAILS: (eventId) => `event:details:${eventId}`,
    EVENT_LIST: (filters) => `events:list:${filters}`,
    BOOKING_DETAILS: (bookingId) => `booking:details:${bookingId}`,
    USER_BOOKINGS: (userId, filters) => `user:bookings:${userId}:${filters}`,
    PROFESSIONAL_PROFILE: (userId) => `professional:profile:${userId}`,
    EVENT_APPLICATIONS: (eventId) => `event:event_applications:${eventId}`,
    SEARCH_RESULTS: (query, filters) => `search:${query}:${filters}`,
    USER_STATISTICS: (userId) => `user:stats:${userId}`,
    POPULAR_EVENTS: () => 'events:popular',
    FEATURED_PROFESSIONALS: () => 'professionals:featured',
};
// TTL configurations for different data types
CacheService.TTL = {
    USER_PROFILE: 15 * 60 * 1000, // 15 minutes
    EVENT_DETAILS: 10 * 60 * 1000, // 10 minutes
    EVENT_LIST: 5 * 60 * 1000, // 5 minutes
    BOOKING_DETAILS: 10 * 60 * 1000, // 10 minutes
    USER_BOOKINGS: 5 * 60 * 1000, // 5 minutes
    SEARCH_RESULTS: 10 * 60 * 1000, // 10 minutes
    STATISTICS: 30 * 60 * 1000, // 30 minutes
    POPULAR_CONTENT: 60 * 60 * 1000, // 1 hour
};
// Singleton instance
exports.cacheService = new CacheService();
// Start automatic cleanup
exports.cacheService.startCleanupInterval();
//# sourceMappingURL=CacheService.js.map