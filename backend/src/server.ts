import app from './app';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import { setupCloudinary } from './config/cloudinary';
import { setupSocketHandlers } from './socket/handlers';
import socketIO from './socket/io';
import { logger } from './utils/logger';

// Load environment variables first
dotenv.config();

// Get PORT from environment variable, ensuring it's a number and has a default
const PORT = Number(process.env.PORT) || 3000;

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  // Add other required env vars
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = socketIO.initialize(server);

// Graceful shutdown handler
const shutdownGracefully = async () => {
  logger.info('Received shutdown signal. Starting graceful shutdown...');
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed. Cleaning up resources...');
    
    try {
      // Disconnect Socket.IO clients
      io.close();
      logger.info('Socket.IO connections closed');
      
      // Disconnect from database
      await disconnectDatabase();
      logger.info('Database connections closed');
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

// Register shutdown handlers
process.on('SIGTERM', shutdownGracefully);
process.on('SIGINT', shutdownGracefully);

// Initialize services
const initializeServices = async () => {
  logger.info('Starting server initialization...', {
    nodeEnv: process.env.NODE_ENV,
    port: PORT,
    platform: process.platform,
    nodeVersion: process.version
  });

  try {
    // Connect to database first
    await connectDatabase();
    logger.info('Database connection established');
    
    // Initialize other services
    await initializeFirebase();
    await setupCloudinary();
    
    // Setup socket handlers
    setupSocketHandlers(io);
    
    // Start listening on port with 0.0.0.0 to accept connections from all interfaces
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`✨ Server is running on port ${PORT}`);
      
      // Log additional info for debugging
      const address = server.address();
      logger.info('Server initialization completed', {
        port: PORT,
        address: typeof address === 'string' ? address : JSON.stringify(address),
        socketioPath: io.path(),
        nodeEnv: process.env.NODE_ENV
      });
    });
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Start the server
initializeServices().catch(error => {
  logger.error('Fatal error during server initialization:', error);
  process.exit(1);
});
