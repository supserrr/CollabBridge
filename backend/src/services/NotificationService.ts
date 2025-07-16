import { prisma } from '../config/database';
import { getIO } from '../socket/io';

export class NotificationService {
  async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      const io = getIO();
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: type as any,
          title,
          message,
          metadata: data ? { data } : undefined,
        },
      });

      // Send real-time notification via Socket.IO
      io.to(`user:${userId}`).emit('notification', notification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}
