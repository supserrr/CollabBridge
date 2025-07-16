import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';

export class MessageController {
  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        lastMessage: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                readAt: null,
                senderId: {
                  not: userId,
                },
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    const total = await prisma.conversation.count({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
    });

    res.json({
      conversations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async getConversationMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!conversation) {
      throw createError('Conversation not found or unauthorized', 404);
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
        isDeleted: false,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    const total = await prisma.message.count({
      where: {
        conversationId: id,
        isDeleted: false,
      },
    });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { recipientId, content, messageType = 'TEXT', metadata } = req.body;

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            id: {
              in: [userId, recipientId],
            },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: userId },
              { id: recipientId },
            ],
          },
        },
        include: {
          participants: true,
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        recipientId,
        content,
        messageType,
        metadata,
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

    // Update conversation's last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageId: message.id,
        lastMessageAt: new Date(),
      },
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  }

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    // Mark all unread messages in conversation as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        recipientId: userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({ message: 'Messages marked as read' });
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    const message = await prisma.message.findFirst({
      where: {
        id,
        senderId: userId,
      },
    });

    if (!message) {
      throw createError('Message not found or unauthorized', 404);
    }

    await prisma.message.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Message deleted successfully' });
  }
}
