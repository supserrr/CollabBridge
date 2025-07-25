import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { getIO } from '../socket/io';

export interface SendMessageData {
  recipientId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'BOOKING_REQUEST';
  metadata?: any;
}

export interface MessageFilters {
  conversationId?: string;
  page?: number;
  limit?: number;
}

export class MessageService {
  async sendMessage(senderId: string, messageData: SendMessageData) {
    try {
      const { recipientId, content, messageType = 'TEXT', metadata } = messageData;

      // Validate recipient exists
      const recipient = await prisma.users.findUnique({
        where: { id: recipientId },
        select: { id: true, isActive: true }
      });

      if (!recipient || !recipient.isActive) {
        throw createError('Recipient not found or inactive', 404);
      }

      // Find or create conversation
      let conversation = await prisma.conversations.findFirst({
        where: {
          users: {
            every: {
              id: { in: [senderId, recipientId] }
            }
          },
          AND: [
            { users: { some: { id: senderId } } },
            { users: { some: { id: recipientId } } }
          ]
        },
        include: {
          users: {
            select: { id: true, name: true, avatar: true }
          }
        }
      });

      if (!conversation) {
        conversation = await prisma.conversations.create({
          data: {
            users: {
              connect: [{ id: senderId }, { id: recipientId }]
            }
          },
          include: {
            users: {
              select: { id: true, name: true, avatar: true }
            }
          }
        });
      }

      // Create message
      const message = await prisma.messages.create({
        data: {
          senderId,
          recipientId,
          conversationId: conversation.id,
          content,
          messageType,
          metadata,
          isRead: false
        },
        include: {
          users_messages_senderIdTousers: {
            select: { id: true, name: true, avatar: true }
          },
          users_messages_recipientIdTousers: {
            select: { id: true, name: true, avatar: true }
          }
        }
      });

      // Update conversation timestamp
      await prisma.conversations.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });

      // Send real-time notification via Socket.IO
      const io = getIO();
      io.to(`user_${recipientId}`).emit('new_message', {
        id: message.id,
        conversationId: conversation.id,
        content: message.content,
        messageType: message.messageType,
        users_messages_senderIdTousers: message.users_messages_senderIdTousers,
        metadata: message.metadata,
        createdAt: message.createdAt,
        isRead: false
      });

      // Update unread count for recipient
      io.to(`user_${recipientId}`).emit('unread_count_update', {
        conversationId: conversation.id,
        increment: 1
      });

      logger.info('Message sent successfully', {
        messageId: message.id,
        senderId,
        recipientId,
        conversationId: conversation.id
      });

      return message;
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  }

  async getConversations(userId: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [conversations, total] = await Promise.all([
        prisma.conversations.findMany({
          where: {
            users: {
              some: { id: userId }
            }
          },
          include: {
            users: {
              where: { id: { not: userId } },
              select: { id: true, name: true, avatar: true, isActive: true }
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                users_messages_senderIdTousers: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            },
            _count: {
              select: {
                messages: {
                  where: {
                    recipientId: userId,
                    isRead: false
                  }
                }
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.conversations.count({
          where: {
            users: {
              some: { id: userId }
            }
          }
        })
      ]);

      return {
        conversations: conversations.map(conv => ({
          ...conv,
          unreadCount: conv._count.messages,
          otherParticipant: conv.users[0] || null,
          lastMessage: conv.messages[0] || null
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Get conversations error:', error);
      throw createError('Failed to fetch conversations', 500);
    }
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    try {
      // Verify user is participant in conversation
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          users: {
            some: { id: userId }
          }
        }
      });

      if (!conversation) {
        throw createError('Conversation not found or access denied', 404);
      }

      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        prisma.messages.findMany({
          where: { conversationId },
          include: {
            users_messages_senderIdTousers: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.messages.count({
          where: { conversationId }
        })
      ]);

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Get messages error:', error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    try {
      // Verify user is participant
      const conversation = await prisma.conversations.findFirst({
        where: {
          id: conversationId,
          users: {
            some: { id: userId }
          }
        }
      });

      if (!conversation) {
        throw createError('Conversation not found or access denied', 404);
      }

      // Mark all unread messages from other participants as read
      const updatedMessages = await prisma.messages.updateMany({
        where: {
          conversationId,
          recipientId: userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      logger.info('Messages marked as read', {
        conversationId,
        userId,
        count: updatedMessages.count
      });

      return updatedMessages.count;
    } catch (error) {
      logger.error('Mark messages as read error:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string, userId: string) {
    try {
      const message = await prisma.messages.findUnique({
        where: { id: messageId },
        include: {
          conversations: {
            include: {
              users: {
                select: { id: true }
              }
            }
          }
        }
      });

      if (!message) {
        throw createError('Message not found', 404);
      }

      // Check if user is sender or participant in conversation
      const isParticipant = message.conversations.users.some(p => p.id === userId);
      const isSender = message.senderId === userId;

      if (!isParticipant) {
        throw createError('Not authorized to delete this message', 403);
      }

      if (isSender) {
        // Sender can delete their own message
        await prisma.messages.delete({
          where: { id: messageId }
        });
      } else {
        // For now, just prevent non-senders from deleting
        throw createError('Only message sender can delete messages', 403);
      }

      // Notify other participants
      const io = getIO();
      message.conversations.users.forEach(participant => {
        if (participant.id !== userId) {
          io.to(`user_${participant.id}`).emit('message_deleted', {
            messageId,
            conversationId: message.conversationId,
            deletedBy: userId
          });
        }
      });

      logger.info('Message deleted', {
        messageId,
        deletedBy: userId,
        isSender
      });

      return true;
    } catch (error) {
      logger.error('Delete message error:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string) {
    try {
      const unreadCount = await prisma.messages.count({
        where: {
          recipientId: userId,
          isRead: false
        }
      });

      return unreadCount;
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw createError('Failed to get unread count', 500);
    }
  }

  async searchMessages(userId: string, query: string, conversationId?: string) {
    try {
      const where: any = {
        OR: [
          { users_messages_senderIdTousers: userId },
          { recipientId: userId }
        ],
        content: {
          contains: query,
          mode: 'insensitive'
        }
      };

      if (conversationId) {
        where.conversationId = conversationId;
      }

      const messages = await prisma.messages.findMany({
        where,
        include: {
          users_messages_senderIdTousers: {
            select: { id: true, name: true, avatar: true }
          },
          conversations: {
            include: {
              users: {
                where: { id: { not: userId } },
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      return messages.map(message => ({
        ...message,
        otherParticipant: message.conversations.users[0] || null
      }));
    } catch (error) {
      logger.error('Search messages error:', error);
      throw createError('Failed to search messages', 500);
    }
  }
}

export const messageService = new MessageService();
