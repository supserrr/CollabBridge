import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface MessageData {
  conversationId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'SYSTEM';
  metadata?: any;
  replyTo?: string;
}

interface TypingData {
  conversationId: string;
  timestamp: number;
}

export class MessagingSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await prisma.users.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          return next(new Error('Authentication error: Invalid user'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      // Cast socket to AuthenticatedSocket after authentication
      const authSocket = socket as AuthenticatedSocket;
      
      logger.info(`User ${authSocket.user.name} connected with socket ${authSocket.id}`);
      
      // Track connected user
      this.connectedUsers.set(authSocket.userId, authSocket.id);
      
      // Join user to their personal room
      authSocket.join(`user:${authSocket.userId}`);
      
      // Notify others that user is online
      authSocket.broadcast.emit('user:online', { userId: authSocket.userId });
      
      // Update user's last active timestamp
      this.updateUserActiveStatus(authSocket.userId, true);

      // Load user's conversations and join rooms
      this.loadUserConversations(authSocket);

      // Message events
      authSocket.on('message:send', (data: MessageData) => this.handleSendMessage(authSocket, data));
      authSocket.on('message:mark-read', (data: { messageId: string }) => this.handleMarkMessageRead(authSocket, data));
      authSocket.on('message:edit', (data: { messageId: string; content: string }) => this.handleEditMessage(authSocket, data));
      authSocket.on('message:delete', (data: { messageId: string }) => this.handleDeleteMessage(authSocket, data));

      // Typing events
      authSocket.on('user:typing', (data: TypingData) => this.handleTyping(authSocket, data));
      authSocket.on('user:stop-typing', (data: { conversationId: string }) => this.handleStopTyping(authSocket, data));

      // Conversation events
      authSocket.on('conversation:create', (data: { participantIds: string[] }) => this.handleCreateConversation(authSocket, data));
      authSocket.on('conversation:join', (data: { conversationId: string }) => this.handleJoinConversation(authSocket, data));
      authSocket.on('conversation:leave', (data: { conversationId: string }) => this.handleLeaveConversation(authSocket, data));

      // Call events (for future video/voice calling)
      authSocket.on('call:initiate', (data: { conversationId: string; type: 'video' | 'audio' }) => this.handleCallInitiate(authSocket, data));
      authSocket.on('call:accept', (data: { callId: string }) => this.handleCallAccept(authSocket, data));
      authSocket.on('call:reject', (data: { callId: string }) => this.handleCallReject(authSocket, data));
      authSocket.on('call:end', (data: { callId: string }) => this.handleCallEnd(authSocket, data));

      // Disconnect handling
      authSocket.on('disconnect', () => this.handleDisconnect(authSocket));
    });
  }

  private async loadUserConversations(socket: AuthenticatedSocket) {
    try {
      const conversations = await prisma.conversations.findMany({
        where: {
          users: {
            some: { id: socket.userId }
          }
        },
        select: { id: true }
      });

      // Join all conversation rooms
      conversations.forEach(conv => {
        socket.join(`conversation:${conv.id}`);
      });

      logger.info(`User ${socket.userId} joined ${conversations.length} conversation rooms`);
    } catch (error) {
      logger.error('Error loading user conversations:', error);
    }
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: MessageData) {
    try {
      // Validate conversation membership
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: data.conversationId,
          users: {
            some: { id: socket.userId }
          }
        },
        include: {
          users: {
            select: { id: true }
          }
        }
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found or access denied' });
        return;
      }

      // Find recipient
      const recipientId = conversation.users.find(u => u.id !== socket.userId)?.id;
      if (!recipientId) {
        socket.emit('error', { message: 'Recipient not found' });
        return;
      }

      // Create message in database
      const message = await prisma.messages.create({
        data: {
          conversationId: data.conversationId,
          senderId: socket.userId,
          recipientId,
          content: data.content,
          messageType: data.messageType as any, // Cast to handle VOICE and SYSTEM types
          metadata: data.metadata || null,
        },
        include: {
          users_messages_senderIdTousers: {
            select: {
              id: true,
              name: true,
              displayName: true,
              avatar: true,
            }
          }
        }
      });

      // Update conversation timestamp
      await prisma.conversations.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() }
      });

      // Emit message to conversation room
      this.io.to(`conversation:${data.conversationId}`).emit('message:new', {
        ...message,
        sender: message.users_messages_senderIdTousers,
        metadata: message.metadata ? JSON.parse(JSON.stringify(message.metadata)) : null
      });

      // Send delivery confirmation to sender
      socket.emit('message:delivered', {
        messageId: message.id,
        deliveredAt: new Date().toISOString()
      });

      // Update message delivery status
      await prisma.messages.update({
        where: { id: message.id },
        data: { 
          metadata: {
            ...(message.metadata && typeof message.metadata === 'object' ? message.metadata : {}),
            deliveredAt: new Date().toISOString()
          }
        }
      });

      // Send push notification if recipient is offline
      const recipientSocketId = this.connectedUsers.get(recipientId);
      if (!recipientSocketId) {
        await this.sendPushNotification(recipientId, {
          title: `New message from ${socket.user.name}`,
          body: data.messageType === 'TEXT' ? data.content : `Sent a ${data.messageType.toLowerCase()}`,
          data: {
            conversationId: data.conversationId,
            messageId: message.id
          }
        });
      }

      logger.info(`Message sent from ${socket.userId} to conversation ${data.conversationId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async handleMarkMessageRead(socket: AuthenticatedSocket, data: { messageId: string }) {
    try {
      const message = await prisma.messages.findFirst({
        where: {
          id: data.messageId,
          recipientId: socket.userId,
        }
      });

      if (!message) {
        return;
      }

      await prisma.messages.update({
        where: { id: data.messageId },
        data: {
          isRead: true,
          readAt: new Date(),
        }
      });

      // Notify sender about read status
      const senderSocketId = this.connectedUsers.get(message.senderId);
      if (senderSocketId) {
        this.io.to(senderSocketId).emit('message:read', {
          messageId: data.messageId,
          readAt: new Date().toISOString()
        });
      }

      logger.info(`Message ${data.messageId} marked as read by ${socket.userId}`);
    } catch (error) {
      logger.error('Error marking message as read:', error);
    }
  }

  private handleTyping(socket: AuthenticatedSocket, data: TypingData) {
    socket.to(`conversation:${data.conversationId}`).emit('user:typing', {
      userId: socket.userId,
      userName: socket.user.name,
      conversationId: data.conversationId,
      timestamp: data.timestamp
    });
  }

  private handleStopTyping(socket: AuthenticatedSocket, data: { conversationId: string }) {
    socket.to(`conversation:${data.conversationId}`).emit('user:stop-typing', {
      userId: socket.userId,
      conversationId: data.conversationId
    });
  }

  private async handleCreateConversation(socket: AuthenticatedSocket, data: { participantIds: string[] }) {
    try {
      // Include current user in participants
      const allParticipants = [...new Set([socket.userId, ...data.participantIds])];
      
      if (allParticipants.length < 2) {
        socket.emit('error', { message: 'At least 2 participants required' });
        return;
      }

      // Check if conversation already exists with these participants
      const existingConversation = await prisma.conversations.findFirst({
        where: {
          AND: allParticipants.map(userId => ({
            users: { some: { id: userId } }
          }))
        },
        include: {
          users: true
        }
      });

      if (existingConversation && existingConversation.users.length === allParticipants.length) {
        socket.emit('conversation:exists', { conversation: existingConversation });
        return;
      }

      // Create new conversation
      const conversation = await prisma.conversations.create({
        data: {
          users: {
            connect: allParticipants.map(id => ({ id }))
          }
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              displayName: true,
              avatar: true,
            }
          }
        }
      });

      // Join all participants to the conversation room
      allParticipants.forEach(userId => {
        const userSocketId = this.connectedUsers.get(userId);
        if (userSocketId) {
          this.io.sockets.sockets.get(userSocketId)?.join(`conversation:${conversation.id}`);
        }
      });

      // Emit to all participants
      this.io.to(`conversation:${conversation.id}`).emit('conversation:created', conversation);

      logger.info(`Conversation ${conversation.id} created with participants: ${allParticipants.join(', ')}`);
    } catch (error) {
      logger.error('Error creating conversation:', error);
      socket.emit('error', { message: 'Failed to create conversation' });
    }
  }

  private handleJoinConversation(socket: AuthenticatedSocket, data: { conversationId: string }) {
    socket.join(`conversation:${data.conversationId}`);
    logger.info(`User ${socket.userId} joined conversation ${data.conversationId}`);
  }

  private handleLeaveConversation(socket: AuthenticatedSocket, data: { conversationId: string }) {
    socket.leave(`conversation:${data.conversationId}`);
    logger.info(`User ${socket.userId} left conversation ${data.conversationId}`);
  }

  // Call handling methods (placeholder for future implementation)
  private handleCallInitiate(socket: AuthenticatedSocket, data: any) {
    // TODO: Implement video/voice calling
    logger.info(`Call initiated by ${socket.userId}`);
  }

  private handleCallAccept(socket: AuthenticatedSocket, data: any) {
    // TODO: Implement call acceptance
    logger.info(`Call accepted by ${socket.userId}`);
  }

  private handleCallReject(socket: AuthenticatedSocket, data: any) {
    // TODO: Implement call rejection
    logger.info(`Call rejected by ${socket.userId}`);
  }

  private handleCallEnd(socket: AuthenticatedSocket, data: any) {
    // TODO: Implement call ending
    logger.info(`Call ended by ${socket.userId}`);
  }

  private async handleEditMessage(socket: AuthenticatedSocket, data: { messageId: string; content: string }) {
    try {
      const message = await prisma.messages.findFirst({
        where: {
          id: data.messageId,
          senderId: socket.userId,
        }
      });

      if (!message) {
        socket.emit('error', { message: 'Message not found or access denied' });
        return;
      }

      // Check if message is within edit time limit (5 minutes)
      const editTimeLimit = 5 * 60 * 1000; // 5 minutes
      const messageAge = Date.now() - new Date(message.createdAt).getTime();
      
      if (messageAge > editTimeLimit) {
        socket.emit('error', { message: 'Message edit time limit exceeded' });
        return;
      }

      const updatedMessage = await prisma.messages.update({
        where: { id: data.messageId },
        data: {
          content: data.content,
          metadata: {
            ...(message.metadata && typeof message.metadata === 'object' ? message.metadata : {}),
            editedAt: new Date().toISOString()
          }
        }
      });

      // Emit to conversation
      this.io.to(`conversation:${message.conversationId}`).emit('message:edited', updatedMessage);

      logger.info(`Message ${data.messageId} edited by ${socket.userId}`);
    } catch (error) {
      logger.error('Error editing message:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  }

  private async handleDeleteMessage(socket: AuthenticatedSocket, data: { messageId: string }) {
    try {
      const message = await prisma.messages.findFirst({
        where: {
          id: data.messageId,
          senderId: socket.userId,
        }
      });

      if (!message) {
        socket.emit('error', { message: 'Message not found or access denied' });
        return;
      }

      await prisma.messages.delete({
        where: { id: data.messageId }
      });

      // Emit to conversation
      this.io.to(`conversation:${message.conversationId}`).emit('message:deleted', {
        messageId: data.messageId,
        conversationId: message.conversationId
      });

      logger.info(`Message ${data.messageId} deleted by ${socket.userId}`);
    } catch (error) {
      logger.error('Error deleting message:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  }

  private async handleDisconnect(socket: AuthenticatedSocket) {
    logger.info(`User ${socket.user.name} disconnected`);
    
    // Remove from connected users
    this.connectedUsers.delete(socket.userId);
    
    // Update user status to offline
    await this.updateUserActiveStatus(socket.userId, false);
    
    // Notify others that user went offline
    socket.broadcast.emit('user:offline', {
      userId: socket.userId,
      lastSeen: new Date().toISOString()
    });
  }

  private async updateUserActiveStatus(userId: string, isActive: boolean) {
    try {
      await prisma.users.update({
        where: { id: userId },
        data: {
          lastActiveAt: new Date(),
          // You might want to add an 'isOnline' field to the user model
        }
      });
    } catch (error) {
      logger.error('Error updating user active status:', error);
    }
  }

  private async sendPushNotification(userId: string, notification: any) {
    // TODO: Implement push notification service
    // This would integrate with Firebase Cloud Messaging, Apple Push Notifications, etc.
    logger.info(`Push notification queued for user ${userId}:`, notification);
  }

  // Public method to send system messages
  public async sendSystemMessage(conversationId: string, content: string, metadata?: any) {
    try {
      const conversation = await prisma.conversations.findUnique({
        where: { id: conversationId },
        include: { users: true }
      });

      if (!conversation) return;

      const message = await prisma.messages.create({
        data: {
          conversationId,
          senderId: 'system',
          recipientId: conversation.users[0].id, // Pick first user as recipient for system messages
          content,
          messageType: 'SYSTEM' as any, // Cast to handle SYSTEM type
          metadata,
        }
      });

      this.io.to(`conversation:${conversationId}`).emit('message:new', message);
    } catch (error) {
      logger.error('Error sending system message:', error);
    }
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
