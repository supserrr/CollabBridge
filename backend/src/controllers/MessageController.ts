import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { io } from '../server';

export class MessageController {
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { receiverId, content, attachments, messageType = 'TEXT', eventId } = req.body;

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        throw createError('Receiver not found', 404);
      }

      const message = await prisma.message.create({
        data: {
          content,
          attachments: attachments || [],
          messageType,
          senderId: req.user!.id,
          receiverId,
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

      // Emit real-time message via Socket.IO
      io.to(`user:${receiverId}`).emit('newMessage', message);

      res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
      throw error;
    }
  }

  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Get unique conversations
      const conversations = await prisma.$queryRaw`
        SELECT DISTINCT
          CASE 
            WHEN sender_id = ${req.user!.id} THEN receiver_id 
            ELSE sender_id 
          END as other_user_id,
          MAX(created_at) as last_message_time
        FROM messages 
        WHERE sender_id = ${req.user!.id} OR receiver_id = ${req.user!.id}
        GROUP BY other_user_id
        ORDER BY last_message_time DESC
        LIMIT ${Number(limit)} OFFSET ${skip}
      ` as Array<{ other_user_id: string; last_message_time: Date }>;

      // Get user details and last message for each conversation
      const conversationDetails = await Promise.all(
        conversations.map(async (conv) => {
          const [otherUser, lastMessage, unreadCount] = await Promise.all([
            prisma.user.findUnique({
              where: { id: conv.other_user_id },
              select: {
                id: true,
                name: true,
                avatar: true,
                isActive: true,
              },
            }),
            prisma.message.findFirst({
              where: {
                OR: [
                  { senderId: req.user!.id, receiverId: conv.other_user_id },
                  { senderId: conv.other_user_id, receiverId: req.user!.id },
                ],
              },
              orderBy: { createdAt: 'desc' },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            }),
            prisma.message.count({
              where: {
                senderId: conv.other_user_id,
                receiverId: req.user!.id,
                isRead: false,
              },
            }),
          ]);

          return {
            otherUser,
            lastMessage,
            unreadCount,
            lastMessageTime: conv.last_message_time,
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
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: {
            OR: [
              { senderId: req.user!.id, receiverId: userId },
              { senderId: userId, receiverId: req.user!.id },
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
        }),
        prisma.message.count({
          where: {
            OR: [
              { senderId: req.user!.id, receiverId: userId },
              { senderId: userId, receiverId: req.user!.id },
            ],
          },
        }),
      ]);

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: userId,
          receiverId: req.user!.id,
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

      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw createError('Message not found', 404);
      }

      if (message.receiverId !== req.user!.id) {
        throw createError('Not authorized to mark this message as read', 403);
      }

      await prisma.message.update({
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
      const unreadCount = await prisma.message.count({
        where: {
          receiverId: req.user!.id,
          isRead: false,
        },
      });

      res.json({ unreadCount });
    } catch (error) {
      throw error;
    }
  }
}
