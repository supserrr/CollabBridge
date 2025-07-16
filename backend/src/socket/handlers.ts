import { Server } from 'socket.io';
import { verifyIdToken } from '../config/firebase';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AuthenticatedSocket {
  userId?: string;
  userRole?: string;
}

export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware for socket connections
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decodedToken = await verifyIdToken(token);
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
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: any) => {
    logger.info(`User connected: ${socket.userId}`);

    // Update user online status
    updateUserOnlineStatus(socket.userId, true);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data: {
      conversationId: string;
      content: string;
      messageType?: string;
      attachments?: string[];
    }) => {
      try {
        // Verify user is part of the conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: data.conversationId,
            participants: {
              some: { id: socket.userId },
            },
          },
          include: {
            participants: { select: { id: true } },
          },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Create the message
        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: socket.userId,
            content: data.content,
            messageType: data.messageType as any || 'TEXT',
            attachments: data.attachments || [],
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        });

        // Update conversation last message
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            lastMessageId: message.id,
            lastMessageAt: new Date(),
          },
        });

        // Emit to all participants in the conversation
        io.to(`conversation:${data.conversationId}`).emit('new_message', message);

        // Send push notifications to offline users
        const offlineParticipants = conversation.participants.filter(
          p => p.id !== socket.userId
        );

        for (const participant of offlineParticipants) {
          // Send notification to user's personal room
          io.to(`user:${participant.id}`).emit('notification', {
            type: 'MESSAGE_RECEIVED',
            title: 'New Message',
            message: `${message.sender.name} sent you a message`,
            data: { conversationId: data.conversationId, messageId: message.id },
          });
        }

      } catch (error) {
        logger.error('Socket message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    // Handle booking updates
    socket.on('booking_update', (data: {
      bookingId: string;
      status: string;
      recipientId: string;
    }) => {
      io.to(`user:${data.recipientId}`).emit('booking_status_update', {
        bookingId: data.bookingId,
        status: data.status,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
      updateUserOnlineStatus(socket.userId, false);
    });
  });
};

const updateUserOnlineStatus = async (userId: string, isOnline: boolean): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastActiveAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Failed to update user online status:', error);
  }
};
