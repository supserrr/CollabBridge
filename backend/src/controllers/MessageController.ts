import { Request, Response } from 'express';
import { messages, MessageType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/express';
import { getIO } from '../socket/io';
import { createError } from '../middleware/errorHandler';

export class MessageController {
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { recipientId, content, messageType = MessageType.TEXT, eventId } = req.body;
      const io = getIO();

      const recipient = await prisma.users.findUnique({
        where: { id: recipientId },
      });

      if (!recipient) {
        throw createError('Recipient not found', 404);
      }

      // Find or create conversation
      const conversation = await prisma.conversations.create({
        data: {
          users: {
            connect: [
              { id: req.user!.id },
              { id: recipientId }
            ]
          }
        }
      });

      const message = await prisma.messages.create({
        data: {
          content,
          messageType,
          conversationId: conversation.id,
          senderId: req.user!.id,
          recipientId,
          metadata: eventId ? { eventId } : undefined
        },
        include: {
          users_messages_senderIdTousers: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          users_messages_recipientIdTousers: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Emit real-time message via Socket.IO
      io.to(`user:${recipientId}`).emit('newMessage', message);

      res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
      throw error;
    }
  }

  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const conversations = await prisma.conversations.findMany({
        where: {
          users: {
            some: {
              id: req.user!.id
            }
          }
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isActive: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              users_messages_senderIdTousers: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: Number(limit)
      });

      const conversationDetails = await Promise.all(
        conversations.map(async (conv) => {
          const otherusers = conv.users.find(p => p.id !== req.user!.id);
          const unreadCount = await prisma.messages.count({
            where: {
              conversationId: conv.id,
              recipientId: req.user!.id,
              isRead: false,
            },
          });

          return {
            id: conv.id,
            otherusers,
            lastMessage: conv.messages[0],
            unreadCount,
            updatedAt: conv.updatedAt
          };
        })
      );

      res.json({
        conversations: conversationDetails,
        pagination: {
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [messages, total] = await Promise.all([
        prisma.messages.findMany({
          where: {
            conversationId
          },
          include: {
            users_messages_senderIdTousers: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            users_messages_recipientIdTousers: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.messages.count({
          where: {
            conversationId
          }
        }),
      ]);

      // Mark messages as read
      await prisma.messages.updateMany({
        where: {
          conversationId,
          recipientId: req.user!.id,
          isRead: false,
        },
        data: { isRead: true },
      });

      res.json({
        messages: messages.reverse(),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      const message = await prisma.messages.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw createError('Message not found', 404);
      }

      if (message.recipientId !== req.user!.id) {
        throw createError('Not authorized to mark this message as read', 403);
      }

      await prisma.messages.update({
        where: { id: messageId },
        data: { isRead: true },
      });

      res.json({ message: 'Message marked as read' });
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const unreadCount = await prisma.messages.count({
        where: {
          recipientId: req.user!.id,
          isRead: false,
        },
      });

      res.json({ unreadCount });
    } catch (error) {
      throw error;
    }
  }
}
