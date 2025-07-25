import { prisma } from '../config/database';
import { getIO } from '../socket/io';
import { logger } from '../utils/logger';
import { EmailService } from './EmailService';
import { createError } from '../middleware/errorHandler';
import { NotificationType } from '@prisma/client';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
  priority?: 'low' | 'normal' | 'high';
  sendEmail?: boolean;
}

export class NotificationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async sendNotification(data: NotificationData): Promise<void> {
    try {
      // Create notification in database
      const notification = await prisma.notifications.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {},
          isRead: false
        }
      });

      // Send real-time notification via Socket.IO
      this.sendRealTimeNotification(data.userId, notification);

      // Send email notification if enabled
      if (data.sendEmail) {
        await this.sendEmailNotification(data);
      }

      logger.info(`Notification sent successfully: ${data.type} to user ${data.userId}`);
    } catch (error) {
      logger.error('Send notification error:', error);
      throw createError('Failed to send notification', 500);
    }
  }

  async sendBookingNotification(
    userId: string,
    type: NotificationType,
    bookingId: string,
    additionalData?: any
  ): Promise<void> {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          events: true,
          creative_profiles: { include: { users: true } }
        }
      });

      if (!booking) {
        throw createError('Booking not found', 404);
      }

      const messages = this.getBookingNotificationMessages(type, booking);
      
      await this.sendNotification({
        userId,
        type,
        title: messages.title,
        message: messages.message,
        metadata: { bookingId, ...additionalData },
        priority: 'high',
        sendEmail: true
      });
    } catch (error) {
      logger.error('Send booking notification error:', error);
      throw error;
    }
  }

  async sendEventNotification(
    userId: string,
    type: NotificationType,
    eventId: string,
    additionalData?: any
  ): Promise<void> {
    try {
      const event = await prisma.events.findUnique({
        where: { id: eventId },
        include: { event_planners: true }
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      const messages = this.getEventNotificationMessages(type, event);
      
      await this.sendNotification({
        userId,
        type,
        title: messages.title,
        message: messages.message,
        metadata: { eventId, ...additionalData },
        priority: 'normal',
        sendEmail: true
      });
    } catch (error) {
      logger.error('Send event notification error:', error);
      throw error;
    }
  }

  async sendMessageNotification(
    recipientId: string,
    users_messages_senderIdTousers: string,
    conversationId: string,
    messagePreview: string
  ): Promise<void> {
    try {
      const sender = await prisma.users.findUnique({
        where: { id: users_messages_senderIdTousers },
        select: { name: true }
      });

      if (!sender) {
        throw createError('Sender not found', 404);
      }

      await this.sendNotification({
        userId: recipientId,
        type: NotificationType.MESSAGE_RECEIVED,
        title: `New message from ${sender.name}`,
        message: messagePreview.length > 100 ? 
          messagePreview.substring(0, 100) + '...' : 
          messagePreview,
        metadata: { senderId: users_messages_senderIdTousers, conversationId },
        priority: 'normal',
        sendEmail: false
      });
    } catch (error) {
      logger.error('Send message notification error:', error);
      throw error;
    }
  }

  async sendReviewNotification(
    userId: string,
    reviewId: string,
    reviewerName: string,
    rating: number
  ): Promise<void> {
    try {
      await this.sendNotification({
        userId,
        type: NotificationType.REVIEW_RECEIVED,
        title: 'New Review Received',
        message: `${reviewerName} left you a ${rating}-star review`,
        metadata: { reviewId, rating },
        priority: 'normal',
        sendEmail: true
      });
    } catch (error) {
      logger.error('Send review notification error:', error);
      throw error;
    }
  }

  async sendReminderNotifications(): Promise<void> {
    try {
      // Event reminders (24 hours before)
      const upcomingEvents = await prisma.events.findMany({
        where: {
          startDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000)
          },
          status: 'PUBLISHED'
        },
        include: { event_planners: true }
      });

      for (const event of upcomingEvents) {
        await this.sendNotification({
          userId: event.creatorId,
          type: NotificationType.EVENT_REMINDER,
          title: 'Event Reminder',
          message: `Your event "${event.title}" is happening tomorrow!`,
          metadata: { eventId: event.id },
          priority: 'normal',
          sendEmail: true
        });
      }

      // Booking reminders (48 hours before)
      const upcomingBookings = await prisma.bookings.findMany({
        where: {
          startDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 48 * 60 * 60 * 1000)
          },
          status: 'CONFIRMED'
        },
        include: {
          events: true,
          creative_profiles: { include: { users: true } }
        }
      });

      for (const booking of upcomingBookings) {
        // Notify professional
        await this.sendNotification({
          userId: booking.creative_profiles.userId,
          type: NotificationType.EVENT_REMINDER,
          title: 'Upcoming Booking',
          message: `You have a booking for "${booking.events.title}" in 2 days`,
          metadata: { bookingId: booking.id },
          priority: 'normal',
          sendEmail: true
        });

        // Notify event planner
        await this.sendNotification({
          userId: booking.eventPlannerId,
          type: NotificationType.EVENT_REMINDER,
          title: 'Upcoming Service',
          message: `${booking.creative_profiles.users.name} will provide services in 2 days`,
          metadata: { bookingId: booking.id },
          priority: 'normal',
          sendEmail: true
        });
      }

      logger.info('Reminder notifications sent successfully');
    } catch (error) {
      logger.error('Send reminder notifications error:', error);
      throw error;
    }
  }

  async getUsersNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = { userId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notifications.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.notifications.count({ where })
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get user notifications error:', error);
      throw createError('Failed to fetch notifications', 500);
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notifications.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true }
      });
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      throw createError('Failed to mark notification as read', 500);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notifications.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    } catch (error) {
      logger.error('Mark all notifications as read error:', error);
      throw createError('Failed to mark all notifications as read', 500);
    }
  }

  // Private helper methods
  private sendRealTimeNotification(userId: string, notification: any): void {
    try {
      const io = getIO();
      io.to(`user_${userId}`).emit('notification', notification);
    } catch (error) {
      logger.error('Send real-time notification error:', error);
    }
  }

  private async sendEmailNotification(data: NotificationData): Promise<void> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: data.userId },
        select: { email: true, name: true }
      });

      if (!user) return;

      // Use the correct EmailService method
      await this.emailService.sendEmail({
        to: user.email,
        subject: data.title,
        text: data.message
      });
    } catch (error) {
      logger.error('Send email notification error:', error);
    }
  }

  private getBookingNotificationMessages(type: NotificationType, booking: any) {
    const eventTitle = booking.events.title;
    const professionalName = booking.creative_profiles.users.name;

    switch (type) {
      case NotificationType.BOOKING_REQUEST:
        return {
          title: 'New Booking Request',
          message: `You have a new booking request for "${eventTitle}"`
        };
      default:
        return {
          title: 'Booking Update',
          message: `Update for your booking: ${eventTitle}`
        };
    }
  }

  private getEventNotificationMessages(type: NotificationType, event: any) {
    const eventTitle = event.title;

    switch (type) {
      case NotificationType.EVENT_REMINDER:
        return {
          title: 'Event Reminder',
          message: `Your event "${eventTitle}" is coming up soon`
        };
      default:
        return {
          title: 'Event Update',
          message: `Update for your event: ${eventTitle}`
        };
    }
  }
}

export const notificationService = new NotificationService();
