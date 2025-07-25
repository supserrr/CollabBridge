export declare class CacheService {
    private memoryCache;
    private defaultTTL;
    private maxMemoryEntries;
    private cleanupInterval;
    constructor();
    private cleanupExpired;
    static readonly KEYS: {
        USER_PROFILE: (userId: string) => string;
        USER_PROFILE_BY_USERNAME: (username: string) => string;
        EVENT_DETAILS: (eventId: string) => string;
        EVENT_LIST: (filters: string) => string;
        BOOKING_DETAILS: (bookingId: string) => string;
        USER_BOOKINGS: (userId: string, filters: string) => string;
        PROFESSIONAL_PROFILE: (userId: string) => string;
        EVENT_APPLICATIONS: (eventId: string) => string;
        SEARCH_RESULTS: (query: string, filters: string) => string;
        USER_STATISTICS: (userId: string) => string;
        POPULAR_EVENTS: () => string;
        FEATURED_PROFESSIONALS: () => string;
    };
    static readonly TTL: {
        USER_PROFILE: number;
        EVENT_DETAILS: number;
        EVENT_LIST: number;
        BOOKING_DETAILS: number;
        USER_BOOKINGS: number;
        SEARCH_RESULTS: number;
        STATISTICS: number;
        POPULAR_CONTENT: number;
    };
    set(key: string, data: any, ttl?: number): Promise<void>;
    get(key: string): Promise<any | null>;
    delete(key: string): Promise<boolean>;
    deletePattern(pattern: string): Promise<number>;
    clear(): Promise<void>;
    getStats(): Promise<{
        redis?: any;
        memory: {
            size: number;
            keys: string[];
        };
    }>;
    wrap<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>;
    invalidateusersCache(userId: string): Promise<void>;
    invalidateEventCache(eventId: string): Promise<void>;
    cleanup(): void;
    startCleanupInterval(intervalMs?: number): NodeJS.Timeout;
    shutdown(): void;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=CacheService.d.ts.map