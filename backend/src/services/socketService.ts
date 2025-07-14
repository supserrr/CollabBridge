import { Server } from 'socket.io';
import { admin } from '../config/firebase';
import { prisma } from '../config/database';

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('No token provided'));
      }

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User ${user.name} connected:`, socket.id);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    // Handle joining event rooms
    socket.on('joinEvent', (eventId: string) => {
      socket.join(`event:${eventId}`);
    });

    // Handle leaving event rooms
    socket.on('leaveEvent', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    // Handle typing indicators
    socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
      socket.to(`user:${data.receiverId}`).emit('userTyping', {
        userId: user.id,
        userName: user.name,
        isTyping: data.isTyping,
      });
    });

    // Handle online status
    socket.on('updateStatus', (status: 'online' | 'away' | 'busy') => {
      socket.broadcast.emit('userStatusUpdate', {
        userId: user.id,
        status,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${user.name} disconnected:`, socket.id);
      
      // Broadcast user offline status
      socket.broadcast.emit('userStatusUpdate', {
        userId: user.id,
        status: 'offline',
      });
    });
  });
};
