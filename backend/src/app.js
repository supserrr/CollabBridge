const express = require('express');
const cors = require('cors');

console.log('🚀 Starting CollabBridge API...');

const app = express();
const port = process.env.PORT || 10000;

console.log(`🔧 Port: ${port}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Updated CORS middleware with your actual Vercel URL
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://collab-bridge.vercel.app',
    'https://collab-bridge-git-main-supserrr.vercel.app',
    'https://collab-bridge-supserrr.vercel.app',
    /^https:\/\/collab-bridge.*\.vercel\.app$/,
    process.env.FRONTEND_URL || '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

console.log('✅ Middleware configured');

// Health check endpoint
app.get('/health', async (req, res) => {
  console.log('📍 Health check requested');
  
  let dbStatus = 'unknown';
  try {
    // Try to connect to database
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    dbStatus = 'connected';
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    dbStatus = 'error';
  }
  
  res.status(200).json({
    status: 'OK',
    service: 'CollabBridge API',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    port: port,
    cors: 'enabled-for-vercel',
    allowedOrigins: [
      'https://collab-bridge.vercel.app',
      'http://localhost:3000'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('📍 Root endpoint requested');
  res.status(200).json({
    message: 'CollabBridge API is running!',
    version: '1.0.0',
    status: 'active',
    port: port,
    cors: 'enabled-for-vercel'
  });
});

// API routes endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'CollabBridge API v1',
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

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!', 
    timestamp: new Date().toISOString(),
    cors: 'enabled-for-vercel'
  });
});

// CORS preflight for all routes
app.options('*', cors());

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      '/',
      '/health',
      '/api',
      '/test'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

console.log('🛣️  Routes configured');

// Start server - CRITICAL: Bind to 0.0.0.0
console.log('🚀 Starting server...');

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SUCCESS! CollabBridge API listening on port ${port}`);
  console.log(`✅ Server ready at http://0.0.0.0:${port}`);
  console.log(`🔗 Health check: http://0.0.0.0:${port}/health`);
  console.log(`🌐 CORS enabled for: https://collab-bridge.vercel.app`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

console.log('📦 App setup complete');

module.exports = app;