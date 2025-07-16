import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware for sockets
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.user?.id}`);

    // Join user to their personal room
    socket.join(`user_${socket.user?.id}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'TEXT' } = data;
        
        // Verify user is part of conversation and create message
        // This would typically be handled by the message controller
        socket.to(`conversation_${conversationId}`).emit('new_message', {
          id: 'temp_id',
          content,
          messageType,
          senderId: socket.user?.id,
          conversationId,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Socket message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.user?.id,
        conversationId,
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        userId: socket.user?.id,
        conversationId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user?.id}`);
    });
  });
};

// Helper function to send notifications via socket
export const sendSocketNotification = (io: Server, userId: string, notification: any): void => {
  io.to(`user_${userId}`).emit('notification', notification);
};
