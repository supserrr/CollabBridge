import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';

export class MessageController {
  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const conversations = await prisma.conversations.findMany({
        where: {
          users: {
            some: { id: userId },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              messageType: true,
              createdAt: true,
              users_messages_senderIdTousers: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: userId },
                  isRead: false,
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        conversations,
      });
    } catch (error) {
      throw error;
    }
  }

  async getConversationMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { page = 1, limit = 50 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Verify user is part of conversation
      const conversation = await prisma.conversations.findFirst({
        where: {
          id,
          users: {
            some: { id: userId },
          },
        },
      });

      if (!conversation) {
        throw createError('Conversation not found or access denied', 404);
      }

      const messages = await prisma.messages.findMany({
        where: { conversationId: id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          users_messages_senderIdTousers: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      res.json({
        success: true,
        messages: messages.reverse(), // Return in chronological order
      });
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { recipientId, content, messageType = 'TEXT', metadata } = req.body;

      // Find or create conversation
      let conversation = await prisma.conversations.findFirst({
        where: {
          AND: [
            { users: { some: { id: userId } } },
            { users: { some: { id: recipientId } } },
          ],
        },
      });

      if (!conversation) {
        conversation = await prisma.conversations.create({
          data: {
            users: {
              connect: [{ id: userId }, { id: recipientId }],
            },
          },
        });
      }

      // Create message
      const message = await prisma.messages.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          recipientId,
          content,
          messageType,
          metadata,
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
            },
          },
        },
      });

      // Update conversation timestamp
      await prisma.conversations.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Update all unread messages in the conversation
      await prisma.messages.updateMany({
        where: {
          conversationId: id,
          recipientId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Messages marked as read',
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const message = await prisma.messages.findUnique({
        where: { id },
      });

      if (!message) {
        throw createError('Message not found', 404);
      }

      if (message.senderId !== userId) {
        throw createError('Not authorized to delete this message', 403);
      }

      await prisma.messages.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}
