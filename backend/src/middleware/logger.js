// backend/src/middleware/logger.js
const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors defined above to the severity levels
winston.addColors(colors);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define the custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.align(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: format,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: format,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // HTTP requests log file
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: format,
    maxsize: 5242880, // 5MB
    maxFiles: 3
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

// Stream object for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Add request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.userId,
      timestamp: new Date().toISOString()
    });
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Database query logger
const dbLogger = (query, params, duration) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database Query', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      params: params ? params.slice(0, 5) : [],
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }
};

// Authentication logger
const authLogger = {
  login: (userId, email, ip) => {
    logger.info('User login', {
      event: 'user_login',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  logout: (userId, ip) => {
    logger.info('User logout', {
      event: 'user_logout',
      userId,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  register: (userId, email, role, ip) => {
    logger.info('User registration', {
      event: 'user_registration',
      userId,
      email,
      role,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  failedLogin: (email, ip, reason) => {
    logger.warn('Failed login attempt', {
      event: 'failed_login',
      email,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  }
};

// Security logger
const securityLogger = {
  suspiciousActivity: (userId, activity, details, ip) => {
    logger.warn('Suspicious activity detected', {
      event: 'suspicious_activity',
      userId,
      activity,
      details,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  rateLimitExceeded: (ip, endpoint) => {
    logger.warn('Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      endpoint,
      timestamp: new Date().toISOString()
    });
  },
  
  unauthorizedAccess: (userId, resource, ip) => {
    logger.warn('Unauthorized access attempt', {
      event: 'unauthorized_access',
      userId,
      resource,
      ip,
      timestamp: new Date().toISOString()
    });
  }
};

// Business logic logger
const businessLogger = {
  eventCreated: (eventId, plannerId, title) => {
    logger.info('Event created', {
      event: 'event_created',
      eventId,
      plannerId,
      title,
      timestamp: new Date().toISOString()
    });
  },
  
  applicationSubmitted: (applicationId, eventId, professionalId) => {
    logger.info('Application submitted', {
      event: 'application_submitted',
      applicationId,
      eventId,
      professionalId,
      timestamp: new Date().toISOString()
    });
  },
  
  applicationStatusChanged: (applicationId, oldStatus, newStatus, plannerId) => {
    logger.info('Application status changed', {
      event: 'application_status_changed',
      applicationId,
      oldStatus,
      newStatus,
      plannerId,
      timestamp: new Date().toISOString()
    });
  },
  
  reviewCreated: (reviewId, fromUserId, toUserId, rating) => {
    logger.info('Review created', {
      event: 'review_created',
      reviewId,
      fromUserId,
      toUserId,
      rating,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance logger
const performanceLogger = {
  slowQuery: (query, duration, params) => {
    logger.warn('Slow database query', {
      event: 'slow_query',
      query: query.substring(0, 200),
      duration: `${duration}ms`,
      params: params ? params.slice(0, 3) : [],
      timestamp: new Date().toISOString()
    });
  },
  
  slowRequest: (method, url, duration, statusCode) => {
    logger.warn('Slow request', {
      event: 'slow_request',
      method,
      url,
      duration: `${duration}ms`,
      statusCode,
      timestamp: new Date().toISOString()
    });
  }
};

// Error context logger
const errorLogger = {
  logError: (error, context = {}) => {
    logger.error(error.message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context,
      timestamp: new Date().toISOString()
    });
  },
  
  logCriticalError: (error, context = {}) => {
    logger.error(`CRITICAL: ${error.message}`, {
      level: 'critical',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context,
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware to add request ID for tracing
const addRequestId = (req, res, next) => {
  const { v4: uuidv4 } = require('uuid');
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Log application startup
const logStartup = (port, environment) => {
  logger.info('🚀 CollabBridge API Server started', {
    event: 'server_startup',
    port,
    environment,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
};

// Log application shutdown
const logShutdown = (reason) => {
  logger.info('🛑 CollabBridge API Server shutting down', {
    event: 'server_shutdown',
    reason,
    timestamp: new Date().toISOString()
  });
};

// Health check logger
const healthLogger = {
  dbConnection: (status, details) => {
    if (status === 'healthy') {
      logger.info('Database health check passed', {
        event: 'db_health_check',
        status,
        details,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.error('Database health check failed', {
        event: 'db_health_check',
        status,
        details,
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = {
  logger,
  requestLogger,
  addRequestId,
  dbLogger,
  authLogger,
  securityLogger,
  businessLogger,
  performanceLogger,
  errorLogger,
  logStartup,
  logShutdown,
  healthLogger
};