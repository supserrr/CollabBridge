// backend/src/middleware/errorHandler.js
const logger = require('./logger');

// Custom error class for application-specific errors
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Database error handler
const handleDatabaseError = (error) => {
  let message = 'Database operation failed';
  let statusCode = 500;

  // PostgreSQL specific error codes
  switch (error.code) {
    case '23505': // Unique violation
      message = 'A record with this information already exists';
      statusCode = 409;
      break;
    case '23503': // Foreign key violation
      message = 'Referenced record does not exist';
      statusCode = 400;
      break;
    case '23502': // Not null violation
      message = 'Required field is missing';
      statusCode = 400;
      break;
    case '22001': // String data too long
      message = 'Input data is too long';
      statusCode = 400;
      break;
    case '42703': // Undefined column
      message = 'Invalid field specified';
      statusCode = 400;
      break;
    case 'ECONNREFUSED':
      message = 'Database connection failed';
      statusCode = 503;
      break;
    default:
      if (error.message.includes('duplicate key')) {
        message = 'A record with this information already exists';
        statusCode = 409;
      } else if (error.message.includes('invalid input syntax')) {
        message = 'Invalid data format provided';
        statusCode = 400;
      }
  }

  return new AppError(message, statusCode);
};

// JWT error handler
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid authentication token', 401);
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError('Authentication token has expired', 401);
  }
  
  return new AppError('Authentication failed', 401);
};

// Firebase error handler
const handleFirebaseError = (error) => {
  let message = 'Firebase authentication failed';
  let statusCode = 401;

  switch (error.code) {
    case 'auth/id-token-expired':
      message = 'Firebase token has expired';
      break;
    case 'auth/id-token-revoked':
      message = 'Firebase token has been revoked';
      break;
    case 'auth/invalid-id-token':
      message = 'Invalid Firebase token';
      break;
    case 'auth/user-not-found':
      message = 'User not found in Firebase';
      statusCode = 404;
      break;
    case 'auth/user-disabled':
      message = 'User account has been disabled';
      statusCode = 403;
      break;
  }

  return new AppError(message, statusCode);
};

// Validation error handler
const handleValidationError = (error) => {
  const errors = error.details || error.errors || [];
  const message = errors.length > 0 
    ? `Validation failed: ${errors.map(e => e.message || e.msg).join(', ')}`
    : 'Validation failed';
  
  return new AppError(message, 400);
};

// Cast error handler (for invalid ObjectIds, UUIDs, etc.)
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      timestamp: err.timestamp || new Date().toISOString(),
      name: err.name,
      code: err.code,
      isOperational: err.isOperational
    }
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
      timestamp: err.timestamp || new Date().toISOString()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('UNEXPECTED ERROR:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  // Ensure error has a status code
  err.statusCode = err.statusCode || 500;
  
  // Log error
  logger.error(`Error ${err.statusCode}: ${err.message}`, {
    error: err,
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId
    }
  });

  // Handle different error types
  let error = { ...err };
  error.message = err.message;

  // Database errors
  if (err.code && (err.code.startsWith('23') || err.code === 'ECONNREFUSED')) {
    error = handleDatabaseError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    error = handleFirebaseError(err);
  }

  // Validation errors
  if (err.name === 'ValidationError' || (err.details && Array.isArray(err.details))) {
    error = handleValidationError(err);
  }

  // Cast errors
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 409);
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Graceful shutdown handler
const gracefulShutdown = (server) => {
  return (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close((err) => {
      if (err) {
        logger.error('Error during server shutdown:', err);
        process.exit(1);
      }
      
      logger.info('Server closed successfully');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };
};

// Unhandled promise rejection handler
const unhandledRejectionHandler = (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  
  if (process.env.NODE_ENV === 'production') {
    // In production, exit gracefully
    process.exit(1);
  }
};

// Uncaught exception handler
const uncaughtExceptionHandler = (err) => {
  logger.error('Uncaught Exception:', err);
  
  // Exit immediately for uncaught exceptions
  process.exit(1);
};

// Rate limit error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    status: 'error',
    message: 'Too many requests. Please try again later.',
    timestamp: new Date().toISOString(),
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
  });
};

// Security error handler
const securityErrorHandler = (err, req, res, next) => {
  // Handle specific security-related errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      status: 'error',
      message: 'Request payload too large',
      timestamp: new Date().toISOString()
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON format',
      timestamp: new Date().toISOString()
    });
  }

  next(err);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  gracefulShutdown,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  rateLimitHandler,
  securityErrorHandler
};