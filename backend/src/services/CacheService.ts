import { logger } from '../utils/logger';
import { getRedisClient, isRedisConnected, isRedisAvailable } from '../config/redis';

interface CacheEntry {
  data: any;
  expiry: number;
}

export class CacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private defaultTTL = 300000; // 5 minutes in milliseconds
  private maxMemoryEntries = 1000; // Limit memory cache size
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Start cleanup interval to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  // Clean up expired entries and enforce size limits
  private cleanupExpired(): void {
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
      logger.debug(`Memory cache cleanup: ${removed} entries removed`);
    }
  }

  // Cache keys for different data types
  static readonly KEYS = {
    USER_PROFILE: (userId: string) => `user:profile:${userId}`,
    USER_PROFILE_BY_USERNAME: (username: string) => `user:profile:username:${username}`,
    EVENT_DETAILS: (eventId: string) => `event:details:${eventId}`,
    EVENT_LIST: (filters: string) => `events:list:${filters}`,
    BOOKING_DETAILS: (bookingId: string) => `booking:details:${bookingId}`,
    USER_BOOKINGS: (userId: string, filters: string) => `user:bookings:${userId}:${filters}`,
    PROFESSIONAL_PROFILE: (userId: string) => `professional:profile:${userId}`,
    EVENT_APPLICATIONS: (eventId: string) => `event:event_applications:${eventId}`,
    SEARCH_RESULTS: (query: string, filters: string) => `search:${query}:${filters}`,
    USER_STATISTICS: (userId: string) => `user:stats:${userId}`,
    POPULAR_EVENTS: () => 'events:popular',
    FEATURED_PROFESSIONALS: () => 'professionals:featured',
  };

  // TTL configurations for different data types
  static readonly TTL = {
    USER_PROFILE: 15 * 60 * 1000, // 15 minutes
    EVENT_DETAILS: 10 * 60 * 1000, // 10 minutes
    EVENT_LIST: 5 * 60 * 1000, // 5 minutes
    BOOKING_DETAILS: 10 * 60 * 1000, // 10 minutes
    USER_BOOKINGS: 5 * 60 * 1000, // 5 minutes
    SEARCH_RESULTS: 10 * 60 * 1000, // 10 minutes
    STATISTICS: 30 * 60 * 1000, // 30 minutes
    POPULAR_CONTENT: 60 * 60 * 1000, // 1 hour
  };

  async set(key: string, data: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      // Try Redis first if available
      if (isRedisAvailable() && isRedisConnected()) {
        const redisClient = getRedisClient();
        if (redisClient) {
          try {
            const serialized = JSON.stringify(data);
            await redisClient.setEx(key, Math.ceil(ttl / 1000), serialized);
            logger.debug(`Redis SET: ${key} (TTL: ${ttl}ms)`);
            return;
          } catch (redisError) {
            logger.warn(`Redis SET failed for key ${key}, falling back to memory cache:`, redisError);
          }
        }
      }

      // Fallback to memory cache
      this.memoryCache.set(key, {
        data,
        expiry: Date.now() + ttl
      });
      
      logger.debug(`Memory Cache SET: ${key} (TTL: ${ttl}ms)`);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      // Try Redis first if available
      if (isRedisAvailable() && isRedisConnected()) {
        const redisClient = getRedisClient();
        if (redisClient) {
          try {
            const cached = await redisClient.get(key);
            if (cached) {
              logger.debug(`Redis HIT: ${key}`);
              return JSON.parse(cached);
            }
            logger.debug(`Redis MISS: ${key}`);
          } catch (redisError) {
            logger.warn(`Redis GET failed for key ${key}, falling back to memory cache:`, redisError);
          }
        }
      }

      // Fallback to memory cache
      const cached = this.memoryCache.get(key);
      
      if (!cached) {
        logger.debug(`Memory Cache MISS: ${key}`);
        return null;
      }
      
      if (Date.now() > cached.expiry) {
        this.memoryCache.delete(key);
        logger.debug(`Memory Cache EXPIRED: ${key}`);
        return null;
      }

      logger.debug(`Memory Cache HIT: ${key}`);
      return cached.data;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      let result = false;

      // Try Redis first if available
      if (isRedisAvailable() && isRedisConnected()) {
        const redisClient = getRedisClient();
        if (redisClient) {
          try {
            const redisResult = await redisClient.del(key);
            result = redisResult > 0;
            if (result) {
              logger.debug(`Redis DELETE: ${key}`);
            }
          } catch (redisError) {
            logger.warn(`Redis DELETE failed for key ${key}:`, redisError);
          }
        }
      }

      // Also delete from memory cache
      const memoryResult = this.memoryCache.delete(key);
      if (memoryResult) {
        logger.debug(`Memory Cache DELETE: ${key}`);
        result = true;
      }

      return result;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      let deletedCount = 0;

      // Try Redis first if available
      if (isRedisAvailable() && isRedisConnected()) {
        const redisClient = getRedisClient();
        if (redisClient) {
          try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
              deletedCount = await redisClient.del(keys);
              logger.debug(`Redis DELETE PATTERN: ${pattern} (${deletedCount} keys)`);
            }
          } catch (redisError) {
            logger.warn(`Redis DELETE PATTERN failed for pattern ${pattern}:`, redisError);
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
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear Redis if available
      if (isRedisAvailable() && isRedisConnected()) {
        const redisClient = getRedisClient();
        if (redisClient) {
          try {
            await redisClient.flushDb();
            logger.info('Redis cache cleared');
          } catch (redisError) {
            logger.warn('Redis cache clear failed:', redisError);
          }
        }
      }

      // Clear memory cache
      const size = this.memoryCache.size;
      this.memoryCache.clear();
      logger.info(`Memory cache cleared: ${size} entries removed`);
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  async getStats(): Promise<{ redis?: any; memory: { size: number; keys: string[] } }> {
    const stats: any = {
      memory: {
        size: this.memoryCache.size,
        keys: Array.from(this.memoryCache.keys())
      }
    };

    try {
      if (isRedisAvailable() && isRedisConnected()) {
        const redisClient = getRedisClient();
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
          } catch (redisError) {
            stats.redis = { connected: false, available: true, error: redisError };
          }
        }
      } else {
        stats.redis = { 
          connected: false, 
          available: isRedisAvailable(),
          message: isRedisAvailable() ? 'Redis available but not connected' : 'Redis not available in this environment'
        };
      }
    } catch (error) {
      logger.error('Error getting Redis stats:', error);
      stats.redis = { connected: false, available: false, error: error };
    }

    return stats;
  }

  // Utility method to wrap database calls with caching
  async wrap<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.defaultTTL
  ): Promise<T> {
    let cached = await this.get(key);
    
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetcher();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      logger.error(`Cache wrap error for key ${key}:`, error);
      throw error;
    }
  }

  // Invalidate cache for user-related data
  async invalidateusersCache(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.delete(CacheService.KEYS.USER_PROFILE(userId)),
        this.delete(CacheService.KEYS.PROFESSIONAL_PROFILE(userId)),
        this.delete(CacheService.KEYS.USER_STATISTICS(userId)),
        this.deletePattern(`user:bookings:${userId}:*`),
      ]);
      logger.debug(`Invalidated cache for user: ${userId}`);
    } catch (error) {
      logger.error('Error invalidating user cache:', error);
    }
  }

  // Invalidate cache for event-related data
  async invalidateEventCache(eventId: string): Promise<void> {
    try {
      await Promise.all([
        this.delete(CacheService.KEYS.EVENT_DETAILS(eventId)),
        this.delete(CacheService.KEYS.EVENT_APPLICATIONS(eventId)),
        this.deletePattern('events:list:*'),
        this.delete(CacheService.KEYS.POPULAR_EVENTS()),
      ]);
      logger.debug(`Invalidated cache for event: ${eventId}`);
    } catch (error) {
      logger.error('Error invalidating event cache:', error);
    }
  }

  // Clean up expired entries (memory cache only)
  cleanup(): void {
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
        logger.info(`Memory cache cleanup: ${removed} expired entries removed`);
      }
    } catch (error) {
      logger.error('Cache cleanup error:', error);
    }
  }

  // Start periodic cleanup
  startCleanupInterval(intervalMs: number = 600000): NodeJS.Timeout { // 10 minutes
    return setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }

  // Shutdown method to clean up resources
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.memoryCache.clear();
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Start automatic cleanup
cacheService.startCleanupInterval();
