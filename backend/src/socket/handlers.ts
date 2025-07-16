import { Server, Socket } from 'socket.io';
import { verifyFirebaseToken } from '../config/firebase';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decodedToken = await verifyFirebaseToken(token);
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        select: { id: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
      logger.info(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${socket.userId} disconnected`);
    });
  });
};

export const sendNotificationToUser = (io: Server, userId: string, notification: any): void => {
  io.to(`user_${userId}`).emit('notification', notification);
};

export const sendMessageToConversation = (io: Server, conversationId: string, message: any): void => {
  io.to(`conversation_${conversationId}`).emit('new_message', message);
};
