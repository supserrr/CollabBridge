import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import { setupCloudinary } from './config/cloudinary';
import { setupSocketHandlers } from './socket/handlers';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import bookingRoutes from './routes/bookings';
import reviewRoutes from './routes/reviews';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/uploads';
import searchRoutes from './routes/search';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

// Initialize services
const initializeServices = async () => {
  logger.info('Initializing services...');
  
  try {
    // Connect to database first
    await connectDatabase();

    // Initialize other services
    if (process.env.FIREBASE_PROJECT_ID) {
      await initializeFirebase();
      logger.info('✅ Firebase initialized successfully');
    }

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      setupCloudinary();
      logger.info('✅ Cloudinary initialized successfully');
    }
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
};

// Create Express app
const app = express();

// Apply global middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initializeServices();
    
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const handleShutdown = async () => {
  logger.info('Received shutdown signal');
  
  try {
    await disconnectDatabase();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// Start the server
startServer();

export { io };
