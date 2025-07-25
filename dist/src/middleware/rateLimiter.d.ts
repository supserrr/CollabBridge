export declare const globalLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const uploadLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const searchLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const messageLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const eventCreationLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const bookingLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const reviewLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const adminLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const createRoleBasedLimiter: (premiumMax: number, regularMax: number, windowMs?: number) => import("express-rate-limit").RateLimitRequestHandler;
export declare const rateLimiters: {
    global: import("express-rate-limit").RateLimitRequestHandler;
    auth: import("express-rate-limit").RateLimitRequestHandler;
    upload: import("express-rate-limit").RateLimitRequestHandler;
    search: import("express-rate-limit").RateLimitRequestHandler;
    message: import("express-rate-limit").RateLimitRequestHandler;
    eventCreation: import("express-rate-limit").RateLimitRequestHandler;
    booking: import("express-rate-limit").RateLimitRequestHandler;
    review: import("express-rate-limit").RateLimitRequestHandler;
    admin: import("express-rate-limit").RateLimitRequestHandler;
    roleBasedApi: import("express-rate-limit").RateLimitRequestHandler;
};
//# sourceMappingURL=rateLimiter.d.ts.map