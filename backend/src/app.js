const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Enhanced error logging for debugging
console.log('🚀 Starting CollabBridge API...');
console.log('📦 Loading environment variables...');

try {
  require('dotenv').config();
  console.log('✅ Environment variables loaded');
} catch (error) {
  console.error('❌ Error loading dotenv:', error.message);
}

console.log('📦 Loading middleware modules...');

let errorHandler;
try {
  errorHandler = require('./middleware/errorHandler');
  console.log('✅ Error handler loaded');
} catch (error) {
  console.error('❌ Error loading errorHandler:', error.message);
  // Provide fallback error handler
  errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };
}

console.log('📦 Loading routes...');

// Import routes with error handling
let authRoutes, userRoutes, eventRoutes, applicationRoutes, reviewRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
  authRoutes = express.Router();
  authRoutes.get('/', (req, res) => res.json({ error: 'Auth routes not available' }));
}

try {
  userRoutes = require('./routes/users');
  console.log('✅ User routes loaded');
} catch (error) {
  console.error('❌ Error loading user routes:', error.message);
  userRoutes = express.Router();
  userRoutes.get('/', (req, res) => res.json({ error: 'User routes not available' }));
}

try {
  eventRoutes = require('./routes/events');
  console.log('✅ Event routes loaded');
} catch (error) {
  console.error('❌ Error loading event routes:', error.message);
  eventRoutes = express.Router();
  eventRoutes.get('/', (req, res) => res.json({ error: 'Event routes not available' }));
}

try {
  applicationRoutes = require('./routes/applications');
  console.log('✅ Application routes loaded');
} catch (error) {
  console.error('❌ Error loading application routes:', error.message);
  applicationRoutes = express.Router();
  applicationRoutes.get('/', (req, res) => res.json({ error: 'Application routes not available' }));
}

try {
  reviewRoutes = require('./routes/reviews');
  console.log('✅ Review routes loaded');
} catch (error) {
  console.error('❌ Error loading review routes:', error.message);
  reviewRoutes = express.Router();
  reviewRoutes.get('/', (req, res) => res.json({ error: 'Review routes not available' }));
}

console.log('📦 Creating Express app...');

const app = express();
const PORT = process.env.PORT || 10000;

console.log(`🔧 Server will run on port: ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️  Database URL present: ${process.env.DATABASE_URL ? 'YES' : 'NO'}`);

// Security middleware
console.log('🔒 Setting up security middleware...');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting
console.log('⏱️  Setting up rate limiting...');
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
console.log('🌐 Setting up CORS...');
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://collabbridge-frontend.onrender.com',
      'https://collabbridge.onrender.com'
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing middleware
console.log('📝 Setting up body parsing...');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

console.log('🛣️  Setting up routes...');

// Root endpoint
app.get('/', (req, res) => {
  console.log('📍 Root endpoint hit');
  res.status(200).json({
    message: 'CollabBridge API is running!',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  console.log('📍 Health check endpoint hit');
  try {
    // Test database connection with fallback
    let dbStatus = 'unknown';
    try {
      const { query } = require('./config/database');
      await query('SELECT 1');
      dbStatus = 'connected';
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      dbStatus = 'disconnected';
    }
    
    res.status(200).json({
      status: 'OK',
      service: 'CollabBridge API',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      service: 'CollabBridge API',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
console.log('🛣️  Mounting API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  console.log('📍 API docs endpoint hit');
  res.status(200).json({
    message: 'CollabBridge API v1.0.0',
    documentation: 'https://github.com/supserrr/CollabBridge#api-documentation',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      events: '/api/events',
      applications: '/api/applications',
      reviews: '/api/reviews'
    },
    status: 'active'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log(`📍 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestion: 'Check the API documentation for available endpoints',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server with enhanced error handling
console.log('🚀 Starting server...');

if (process.env.NODE_ENV !== 'test') {
  try {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 CollabBridge API Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`📚 API docs: http://0.0.0.0:${PORT}/api`);
      console.log(`🌐 Binding to 0.0.0.0 for Render deployment`);
      console.log(`✅ Server is ready to accept connections!`);
      
      // Log environment info
      if (process.env.NODE_ENV === 'production') {
        console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Custom config'}`);
        console.log(`🌐 CORS: ${process.env.FRONTEND_URL || 'Multiple origins allowed'}`);
      }
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else if (error.code === 'EACCES') {
        console.error(`❌ Permission denied to bind to port ${PORT}`);
      }
      process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

console.log('📦 App module ready for export');
module.exports = app;