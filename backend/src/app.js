const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const applicationRoutes = require('./routes/applications');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 10000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting - more lenient for production
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased for production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration - Enhanced for production
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
      callback(null, true); // Allow all origins for now, restrict later
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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint - Enhanced
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
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      service: 'CollabBridge API',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
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
    status: 'active'
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

// Start server - CRITICAL FIX: Bind to 0.0.0.0 for Render deployment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CollabBridge API Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`📚 API docs: http://0.0.0.0:${PORT}/api`);
    console.log(`🌐 Binding to 0.0.0.0 for Render deployment`);
    
    // Log environment info
    if (process.env.NODE_ENV === 'production') {
      console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Custom config'}`);
      console.log(`🌐 CORS: ${process.env.FRONTEND_URL || 'Multiple origins allowed'}`);
    }
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });
}

module.exports = app;