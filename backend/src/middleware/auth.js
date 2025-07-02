// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid authentication token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User associated with token no longer exists'
      });
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      firebaseUid: decoded.firebaseUid
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

// Optional authentication (for endpoints that work with or without auth)
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (user) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        firebaseUid: decoded.firebaseUid
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    next();
  }
};

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `Access restricted to: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user is a planner
const requirePlanner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.role !== 'planner') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This endpoint is restricted to event planners only'
    });
  }

  next();
};

// Check if user is a professional
const requireProfessional = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.role !== 'professional') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This endpoint is restricted to creative professionals only'
    });
  }

  next();
};

// Check if user owns the resource (for profile updates, etc.)
const requireOwnership = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    const resourceUserId = req.params[userIdParam];
    if (req.user.userId !== resourceUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

// Rate limiting for authentication endpoints
const authRateLimit = (req, res, next) => {
  // This would typically use a Redis store or similar for production
  // For now, we'll implement a simple in-memory rate limiter
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // Initialize rate limit store if it doesn't exist
  if (!global.authRateLimitStore) {
    global.authRateLimitStore = new Map();
  }

  const key = `auth_${ip}`;
  const record = global.authRateLimitStore.get(key) || { attempts: 0, resetTime: now + windowMs };

  // Reset if window has expired
  if (now > record.resetTime) {
    record.attempts = 0;
    record.resetTime = now + windowMs;
  }

  // Check if limit exceeded
  if (record.attempts >= maxAttempts) {
    return res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Please wait before trying again',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }

  // Increment attempts
  record.attempts++;
  global.authRateLimitStore.set(key, record);

  next();
};

// Middleware to validate API key for external integrations (future use)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide a valid API key'
    });
  }

  // TODO: Implement API key validation logic
  // For now, just check against environment variable
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is invalid'
    });
  }

  next();
};

// Middleware to refresh token if it's close to expiring
const refreshTokenIfNeeded = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.decode(token);
    
    // Check if token expires within the next hour
    const oneHour = 60 * 60; // 1 hour in seconds
    const timeUntilExpiry = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (timeUntilExpiry < oneHour && timeUntilExpiry > 0) {
      // Generate new token
      const newToken = jwt.sign(
        { 
          userId: req.user.userId, 
          email: req.user.email, 
          role: req.user.role,
          firebaseUid: req.user.firebaseUid 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Add new token to response headers
      res.setHeader('X-New-Token', newToken);
    }

    next();
  } catch (error) {
    // If refresh fails, continue without refreshing
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  requirePlanner,
  requireProfessional,
  requireOwnership,
  authRateLimit,
  validateApiKey,
  refreshTokenIfNeeded
};