"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiters = exports.createRoleBasedLimiter = exports.adminLimiter = exports.reviewLimiter = exports.bookingLimiter = exports.eventCreationLimiter = exports.messageLimiter = exports.searchLimiter = exports.uploadLimiter = exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../utils/logger");
// Custom key generator for user-specific rate limiting
const userKeyGenerator = (req) => {
    const userId = req.user?.id;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return userId ? `user:${userId}` : `ip:${ip}`;
};
// Custom handler for rate limit logging
const createLimitHandler = (context) => {
    return (req, res) => {
        logger_1.logger.warn(`${context} rate limit reached`, {
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get('users-Agent'),
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            error: 'Too many requests, please try again later.',
            context,
            retryAfter: res.getHeader('Retry-After')
        });
    };
};
// Global rate limiter (fallback)
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: createLimitHandler('Global')
});
// Authentication endpoints - stricter limits
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.ip || 'unknown',
    handler: createLimitHandler('Authentication')
});
// File upload endpoints
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: {
        error: 'Too many file uploads, please try again later.',
        retryAfter: '1 hour'
    },
    keyGenerator: userKeyGenerator,
    handler: createLimitHandler('Upload')
});
// Search endpoints
exports.searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // 100 searches per 10 minutes
    message: {
        error: 'Too many search requests, please try again later.',
        retryAfter: '10 minutes'
    },
    keyGenerator: userKeyGenerator,
    handler: createLimitHandler('Search')
});
// Message/notification endpoints
exports.messageLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // 200 messages per hour
    message: {
        error: 'Too many messages sent, please try again later.',
        retryAfter: '1 hour'
    },
    keyGenerator: userKeyGenerator,
    skipSuccessfulRequests: false,
    handler: createLimitHandler('Message')
});
// Event creation (for event planners)
exports.eventCreationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 20, // 20 events per day
    message: {
        error: 'Too many events created today, please try again tomorrow.',
        retryAfter: '24 hours'
    },
    keyGenerator: userKeyGenerator,
    handler: createLimitHandler('Event Creation')
});
// Booking creation
exports.bookingLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 bookings per hour
    message: {
        error: 'Too many booking requests, please try again later.',
        retryAfter: '1 hour'
    },
    keyGenerator: userKeyGenerator,
    handler: createLimitHandler('Booking')
});
// Review creation
exports.reviewLimiter = (0, express_rate_limit_1.default)({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // 10 reviews per day
    message: {
        error: 'Too many reviews submitted today, please try again tomorrow.',
        retryAfter: '24 hours'
    },
    keyGenerator: userKeyGenerator,
    handler: createLimitHandler('Review')
});
// Admin endpoints - more restrictive
exports.adminLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        error: 'Too many admin requests, please try again later.',
        retryAfter: '15 minutes'
    },
    keyGenerator: userKeyGenerator,
    handler: createLimitHandler('Admin')
});
// Dynamic rate limiter based on user role
const createRoleBasedLimiter = (premiumMax, regularMax, windowMs = 15 * 60 * 1000) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max: (req) => {
            const user = req.user;
            if (!user)
                return Math.floor(regularMax * 0.5); // Unauthenticated users get less
            // Premium users or admins get higher limits
            if (user.role === 'ADMIN' || user.isPremium) {
                return premiumMax;
            }
            return regularMax;
        },
        message: (req) => ({
            error: 'Rate limit exceeded. Consider upgrading to premium for higher limits.',
            retryAfter: Math.ceil(windowMs / 60000) + ' minutes'
        }),
        keyGenerator: userKeyGenerator,
        handler: createLimitHandler('Role-based API')
    });
};
exports.createRoleBasedLimiter = createRoleBasedLimiter;
// Export configured limiters
exports.rateLimiters = {
    global: exports.globalLimiter,
    auth: exports.authLimiter,
    upload: exports.uploadLimiter,
    search: exports.searchLimiter,
    message: exports.messageLimiter,
    eventCreation: exports.eventCreationLimiter,
    booking: exports.bookingLimiter,
    review: exports.reviewLimiter,
    admin: exports.adminLimiter,
    roleBasedApi: (0, exports.createRoleBasedLimiter)(1000, 500), // Premium vs regular API access
};
//# sourceMappingURL=rateLimiter.js.map