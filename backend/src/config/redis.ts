import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

class RedisConfig {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private isRedisAvailable = false;

  async connect(): Promise<RedisClientType | null> {
    // Check if Redis is available in the environment
    if (!process.env.REDIS_URL) {
      if (process.env.NODE_ENV === 'production') {
        logger.warn('Redis URL not provided in production environment. Redis caching will be disabled.');
      } else {
        logger.info('Redis URL not provided in development. Using memory cache fallback.');
      }
      this.isRedisAvailable = false;
      return null;
    }

    try {
      const redisUrl = process.env.REDIS_URL;
      logger.info('Attempting to connect to Redis...');
      
      // Configure connection with appropriate timeouts
      const connectTimeout = process.env.NODE_ENV === 'production' ? 15000 : 10000;
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout,
          reconnectStrategy: (retries) => {
            logger.warn(`Redis reconnection attempt ${retries}`);
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries. Disabling Redis.');
              this.isRedisAvailable = false;
              return false; // Stop reconnection attempts
            }
            return Math.min(retries * 500, 3000);
          },
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err.message);
        this.isConnected = false;
        // Don't completely disable Redis on transient errors
        if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
          logger.warn('Redis connection error, will attempt to reconnect...');
        }
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis client connected successfully');
        this.isConnected = true;
        this.isRedisAvailable = true;
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis client ready for commands');
        this.isRedisAvailable = true;
      });

      this.client.on('end', () => {
        logger.info('Redis client connection ended');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client attempting to reconnect...');
      });

      // Attempt connection with timeout
      logger.info('Connecting to Redis...');
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Redis connection timeout')), connectTimeout);
        })
      ]);
      
      logger.info('✅ Redis connection established successfully');
      this.isRedisAvailable = true;
      return this.client;
    } catch (error) {
      logger.warn(`Failed to connect to Redis: ${error instanceof Error ? error.message : 'Unknown error'}. Continuing without Redis.`);
      this.client = null;
      this.isConnected = false;
      this.isRedisAvailable = false;
      return null;
    }
  }

  getClient(): RedisClientType | null {
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected && this.client?.isReady === true;
  }

  isAvailable(): boolean {
    return this.isRedisAvailable;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        logger.info('Redis client disconnected');
      } catch (error) {
        logger.error('Error disconnecting Redis client:', error);
      }
    }
  }
}

export const redisConfig = new RedisConfig();
export const connectRedis = () => redisConfig.connect();
export const getRedisClient = () => redisConfig.getClient();
export const isRedisConnected = () => redisConfig.isClientConnected();
export const isRedisAvailable = () => redisConfig.isAvailable();
export const disconnectRedis = () => redisConfig.disconnect();
