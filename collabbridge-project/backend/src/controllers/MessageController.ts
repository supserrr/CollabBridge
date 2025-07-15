import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { uploadToCloudinary } from '../config/cloudinary';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class MessageController {
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id },
            { receiverId: req.user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({ conversations });
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { receiverId, content, messageType = 'TEXT', eventId } = req.body;

      let attachmentUrls: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map((file: Express.Multer.File) =>
          uploadToCloudinary(file.buffer, 'messages')
        );
        const results = await Promise.all(uploadPromises);
        attachmentUrls = results.map((result) => result.secure_url);
      }

      const message = await prisma.message.create({
        data: {
          senderId: req.user.id,
          receiverId,
          content,
          messageType,
          attachments: attachmentUrls,
          eventId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;

      await prisma.message.update({
        where: {
          id,
          receiverId: req.user.id,
        },
        data: { isRead: true },
      });

      res.json({ message: 'Message marked as read' });
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const count = await prisma.message.count({
        where: {
          receiverId: req.user.id,
          isRead: false,
        },
      });

      res.json({ unreadCount: count });
    } catch (error) {
      throw error;
    }
  }

  async getConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: id },
            { senderId: id, receiverId: req.user.id },
          ],
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      });

      res.json({ messages: messages.reverse() });
    } catch (error) {
      throw error;
    }
  }

  async createConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { participantId } = req.body;

      const participant = await prisma.user.findUnique({
        where: { id: participantId },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });

      if (!participant) {
        throw createError('Participant not found', 404);
      }

      res.json({
        conversation: {
          participant,
          lastMessage: null,
          unreadCount: 0,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async editMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      const { content } = req.body;

      const updatedMessage = await prisma.message.update({
        where: {
          id,
          senderId: req.user.id,
        },
        data: {
          content,
          isEdited: true,
        },
      });

      res.json({
        message: 'Message updated successfully',
        data: updatedMessage,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;

      await prisma.message.delete({
        where: {
          id,
          senderId: req.user.id,
        },
      });

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      throw error;
    }
  }

  async markMultipleAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { messageIds } = req.body;

      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          receiverId: req.user.id,
        },
        data: { isRead: true },
      });

      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      throw error;
    }
  }
}
