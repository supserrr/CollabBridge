import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// Custom key generator for user-specific rate limiting
const userKeyGenerator = (req: Request): string => {
  const userId = (req as any).user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  return userId ? `user:${userId}` : `ip:${ip}`;
};

// Custom handler for rate limit logging
const createLimitHandler = (context: string) => {
  return (req: Request, res: Response) => {
    logger.warn(`${context} rate limit reached`, {
      userId: (req as any).user?.id,
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
export const globalLimiter = rateLimit({
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
export const authLimiter = rateLimit({
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
export const uploadLimiter = rateLimit({
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
export const searchLimiter = rateLimit({
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
export const messageLimiter = rateLimit({
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
export const eventCreationLimiter = rateLimit({
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
export const bookingLimiter = rateLimit({
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
export const reviewLimiter = rateLimit({
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
export const adminLimiter = rateLimit({
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
export const createRoleBasedLimiter = (
  premiumMax: number,
  regularMax: number,
  windowMs: number = 15 * 60 * 1000
) => {
  return rateLimit({
    windowMs,
    max: (req: Request) => {
      const user = (req as any).user;
      if (!user) return Math.floor(regularMax * 0.5); // Unauthenticated users get less
      
      // Premium users or admins get higher limits
      if (user.role === 'ADMIN' || user.isPremium) {
        return premiumMax;
      }
      
      return regularMax;
    },
    message: (req: Request) => ({
      error: 'Rate limit exceeded. Consider upgrading to premium for higher limits.',
      retryAfter: Math.ceil(windowMs / 60000) + ' minutes'
    }),
    keyGenerator: userKeyGenerator,
    handler: createLimitHandler('Role-based API')
  });
};

// Export configured limiters
export const rateLimiters = {
  global: globalLimiter,
  auth: authLimiter,
  upload: uploadLimiter,
  search: searchLimiter,
  message: messageLimiter,
  eventCreation: eventCreationLimiter,
  booking: bookingLimiter,
  review: reviewLimiter,
  admin: adminLimiter,
  roleBasedApi: createRoleBasedLimiter(1000, 500), // Premium vs regular API access
};
