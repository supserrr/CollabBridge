import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { eventRoutes } from './routes/events';
import { bookingRoutes } from './routes/bookings';
import { reviewRoutes } from './routes/reviews';
import { messageRoutes } from './routes/messages';
import { uploadRoutes } from './routes/uploads';
import { searchRoutes } from './routes/search';
import { adminRoutes } from './routes/admin';
import { setupSocketHandlers } from './services/socketService';
import { initializeFirebase } from './config/firebase';
import { connectDatabase, disconnectDatabase } from './config/database';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Initialize services
const initializeServices = async () => {
  try {
    await connectDatabase();
    initializeFirebase();
    console.log('🚀 All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // limit each IP
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV 
  });
});

// Setup Socket.IO
setupSocketHandlers(io);

// Error handling (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('📥 Received shutdown signal, shutting down gracefully...');
  
  server.close(async () => {
    console.log('🔌 HTTP server closed');
    await disconnectDatabase();
    console.log('💾 Database disconnected');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
initializeServices().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Socket.IO server ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
});

export { io };
