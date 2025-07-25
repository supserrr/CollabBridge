import { RedisClientType } from 'redis';
declare class RedisConfig {
    private client;
    private isConnected;
    private isRedisAvailable;
    connect(): Promise<RedisClientType | null>;
    getClient(): RedisClientType | null;
    isClientConnected(): boolean;
    isAvailable(): boolean;
    disconnect(): Promise<void>;
}
export declare const redisConfig: RedisConfig;
export declare const connectRedis: () => Promise<RedisClientType | null>;
export declare const getRedisClient: () => RedisClientType | null;
export declare const isRedisConnected: () => boolean;
export declare const isRedisAvailable: () => boolean;
export declare const disconnectRedis: () => Promise<void>;
export {};
//# sourceMappingURL=redis.d.ts.map