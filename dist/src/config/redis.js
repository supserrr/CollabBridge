"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRedis = exports.isRedisAvailable = exports.isRedisConnected = exports.getRedisClient = exports.connectRedis = exports.redisConfig = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
class RedisConfig {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.isRedisAvailable = false;
    }
    async connect() {
        // Check if Redis is available in the environment
        if (!process.env.REDIS_URL) {
            if (process.env.NODE_ENV === 'production') {
                logger_1.logger.warn('Redis URL not provided in production environment. Redis caching will be disabled.');
            }
            else {
                logger_1.logger.info('Redis URL not provided in development. Using memory cache fallback.');
            }
            this.isRedisAvailable = false;
            return null;
        }
        try {
            const redisUrl = process.env.REDIS_URL;
            logger_1.logger.info('Attempting to connect to Redis...');
            // Configure connection with appropriate timeouts
            const connectTimeout = process.env.NODE_ENV === 'production' ? 15000 : 10000;
            this.client = (0, redis_1.createClient)({
                url: redisUrl,
                socket: {
                    connectTimeout,
                    reconnectStrategy: (retries) => {
                        logger_1.logger.warn(`Redis reconnection attempt ${retries}`);
                        if (retries > 10) {
                            logger_1.logger.error('Redis connection failed after 10 retries. Disabling Redis.');
                            this.isRedisAvailable = false;
                            return false; // Stop reconnection attempts
                        }
                        return Math.min(retries * 500, 3000);
                    },
                }
            });
            this.client.on('error', (err) => {
                logger_1.logger.error('Redis Client Error:', err.message);
                this.isConnected = false;
                // Don't completely disable Redis on transient errors
                if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
                    logger_1.logger.warn('Redis connection error, will attempt to reconnect...');
                }
            });
            this.client.on('connect', () => {
                logger_1.logger.info('✅ Redis client connected successfully');
                this.isConnected = true;
                this.isRedisAvailable = true;
            });
            this.client.on('ready', () => {
                logger_1.logger.info('✅ Redis client ready for commands');
                this.isRedisAvailable = true;
            });
            this.client.on('end', () => {
                logger_1.logger.info('Redis client connection ended');
                this.isConnected = false;
            });
            this.client.on('reconnecting', () => {
                logger_1.logger.info('Redis client attempting to reconnect...');
            });
            // Attempt connection with timeout
            logger_1.logger.info('Connecting to Redis...');
            await Promise.race([
                this.client.connect(),
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Redis connection timeout')), connectTimeout);
                })
            ]);
            logger_1.logger.info('✅ Redis connection established successfully');
            this.isRedisAvailable = true;
            return this.client;
        }
        catch (error) {
            logger_1.logger.warn(`Failed to connect to Redis: ${error instanceof Error ? error.message : 'Unknown error'}. Continuing without Redis.`);
            this.client = null;
            this.isConnected = false;
            this.isRedisAvailable = false;
            return null;
        }
    }
    getClient() {
        return this.client;
    }
    isClientConnected() {
        return this.isConnected && this.client?.isReady === true;
    }
    isAvailable() {
        return this.isRedisAvailable;
    }
    async disconnect() {
        if (this.client) {
            try {
                await this.client.quit();
                logger_1.logger.info('Redis client disconnected');
            }
            catch (error) {
                logger_1.logger.error('Error disconnecting Redis client:', error);
            }
        }
    }
}
exports.redisConfig = new RedisConfig();
const connectRedis = () => exports.redisConfig.connect();
exports.connectRedis = connectRedis;
const getRedisClient = () => exports.redisConfig.getClient();
exports.getRedisClient = getRedisClient;
const isRedisConnected = () => exports.redisConfig.isClientConnected();
exports.isRedisConnected = isRedisConnected;
const isRedisAvailable = () => exports.redisConfig.isAvailable();
exports.isRedisAvailable = isRedisAvailable;
const disconnectRedis = () => exports.redisConfig.disconnect();
exports.disconnectRedis = disconnectRedis;
//# sourceMappingURL=redis.js.map