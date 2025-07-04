const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const applicationRoutes = require('./routes/applications');
const reviewRoutes = require('./routes/reviews');

const app = express();

// RENDER REQUIREMENT: Use PORT environment variable (defaults to 10000)
const port = process.env.PORT || 10000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
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
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
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
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'CollabBridge API is running!',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: port
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { query } = require('./config/database');
    await query('SELECT 1');
    
    res.status(200).json({
      status: 'OK',
      service: 'CollabBridge API',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      port: port
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      service: 'CollabBridge API',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
      port: port
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
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
    status: 'active',
    port: port
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
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

// RENDER REQUIREMENT: Bind to 0.0.0.0 and use PORT environment variable
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 CollabBridge API listening on port ${port}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://0.0.0.0:${port}/health`);
    console.log(`📚 API docs: http://0.0.0.0:${port}/api`);
    console.log(`✅ Server ready to accept connections on 0.0.0.0:${port}`);
    
    // Log environment info
    if (process.env.NODE_ENV === 'production') {
      console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Custom config'}`);
      console.log(`🌐 CORS: ${process.env.FRONTEND_URL || 'Multiple origins allowed'}`);
    }
  });
}

module.exports = app;