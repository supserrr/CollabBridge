import { Request, Response } from 'express';
import { prisma } from '../../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Get all notifications for a user with pagination
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where: {
          userId: userId,
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notifications.count({
        where: {
          userId: userId,
        },
      }),
    ]);

    const unreadCount = await prisma.notifications.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const notification = await prisma.notifications.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    await prisma.notifications.update({
      where: { id },
      data: { 
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await prisma.notifications.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const notification = await prisma.notifications.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    await prisma.notifications.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
};

// Create a new notification (internal use)
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, metadata, actionUrl } = req.body;

    if (!userId || !type || !title || !message) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, title, message',
      });
      return;
    }

    const notification = await prisma.notifications.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata || null,
        isRead: false,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
    });
  }
};

// Helper function to create notifications programmatically
export const createNotificationHelper = async (
  userId: string,
  type: 'BOOKING_REQUEST' | 'APPLICATION_UPDATE' | 'REVIEW_RECEIVED' | 'MESSAGE_RECEIVED' | 'EVENT_REMINDER' | 'SYSTEM_ANNOUNCEMENT',
  title: string,
  message: string,
  metadata?: any,
  actionUrl?: string
) => {
  try {
    const notification = await prisma.notifications.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata || null,
        isRead: false,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const count = await prisma.notifications.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
    });
  }
};
