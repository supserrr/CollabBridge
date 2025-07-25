"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const database_1 = require("../config/database");
const io_1 = require("../socket/io");
const logger_1 = require("../utils/logger");
const EmailService_1 = require("./EmailService");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
class NotificationService {
    constructor() {
        this.emailService = new EmailService_1.EmailService();
    }
    async sendNotification(data) {
        try {
            // Create notification in database
            const notification = await database_1.prisma.notifications.create({
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
            logger_1.logger.info(`Notification sent successfully: ${data.type} to user ${data.userId}`);
        }
        catch (error) {
            logger_1.logger.error('Send notification error:', error);
            throw (0, errorHandler_1.createError)('Failed to send notification', 500);
        }
    }
    async sendBookingNotification(userId, type, bookingId, additionalData) {
        try {
            const booking = await database_1.prisma.bookings.findUnique({
                where: { id: bookingId },
                include: {
                    events: true,
                    creative_profiles: { include: { users: true } }
                }
            });
            if (!booking) {
                throw (0, errorHandler_1.createError)('Booking not found', 404);
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
        }
        catch (error) {
            logger_1.logger.error('Send booking notification error:', error);
            throw error;
        }
    }
    async sendEventNotification(userId, type, eventId, additionalData) {
        try {
            const event = await database_1.prisma.events.findUnique({
                where: { id: eventId },
                include: { event_planners: true }
            });
            if (!event) {
                throw (0, errorHandler_1.createError)('Event not found', 404);
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
        }
        catch (error) {
            logger_1.logger.error('Send event notification error:', error);
            throw error;
        }
    }
    async sendMessageNotification(recipientId, users_messages_senderIdTousers, conversationId, messagePreview) {
        try {
            const sender = await database_1.prisma.users.findUnique({
                where: { id: users_messages_senderIdTousers },
                select: { name: true }
            });
            if (!sender) {
                throw (0, errorHandler_1.createError)('Sender not found', 404);
            }
            await this.sendNotification({
                userId: recipientId,
                type: client_1.NotificationType.MESSAGE_RECEIVED,
                title: `New message from ${sender.name}`,
                message: messagePreview.length > 100 ?
                    messagePreview.substring(0, 100) + '...' :
                    messagePreview,
                metadata: { senderId: users_messages_senderIdTousers, conversationId },
                priority: 'normal',
                sendEmail: false
            });
        }
        catch (error) {
            logger_1.logger.error('Send message notification error:', error);
            throw error;
        }
    }
    async sendReviewNotification(userId, reviewId, reviewerName, rating) {
        try {
            await this.sendNotification({
                userId,
                type: client_1.NotificationType.REVIEW_RECEIVED,
                title: 'New Review Received',
                message: `${reviewerName} left you a ${rating}-star review`,
                metadata: { reviewId, rating },
                priority: 'normal',
                sendEmail: true
            });
        }
        catch (error) {
            logger_1.logger.error('Send review notification error:', error);
            throw error;
        }
    }
    async sendReminderNotifications() {
        try {
            // Event reminders (24 hours before)
            const upcomingEvents = await database_1.prisma.events.findMany({
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
                    type: client_1.NotificationType.EVENT_REMINDER,
                    title: 'Event Reminder',
                    message: `Your event "${event.title}" is happening tomorrow!`,
                    metadata: { eventId: event.id },
                    priority: 'normal',
                    sendEmail: true
                });
            }
            // Booking reminders (48 hours before)
            const upcomingBookings = await database_1.prisma.bookings.findMany({
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
                    type: client_1.NotificationType.EVENT_REMINDER,
                    title: 'Upcoming Booking',
                    message: `You have a booking for "${booking.events.title}" in 2 days`,
                    metadata: { bookingId: booking.id },
                    priority: 'normal',
                    sendEmail: true
                });
                // Notify event planner
                await this.sendNotification({
                    userId: booking.eventPlannerId,
                    type: client_1.NotificationType.EVENT_REMINDER,
                    title: 'Upcoming Service',
                    message: `${booking.creative_profiles.users.name} will provide services in 2 days`,
                    metadata: { bookingId: booking.id },
                    priority: 'normal',
                    sendEmail: true
                });
            }
            logger_1.logger.info('Reminder notifications sent successfully');
        }
        catch (error) {
            logger_1.logger.error('Send reminder notifications error:', error);
            throw error;
        }
    }
    async getUsersNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        try {
            const skip = (page - 1) * limit;
            const where = { userId };
            if (unreadOnly) {
                where.isRead = false;
            }
            const [notifications, total] = await Promise.all([
                database_1.prisma.notifications.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                database_1.prisma.notifications.count({ where })
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
        }
        catch (error) {
            logger_1.logger.error('Get user notifications error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch notifications', 500);
        }
    }
    async markNotificationAsRead(notificationId, userId) {
        try {
            await database_1.prisma.notifications.updateMany({
                where: { id: notificationId, userId },
                data: { isRead: true }
            });
        }
        catch (error) {
            logger_1.logger.error('Mark notification as read error:', error);
            throw (0, errorHandler_1.createError)('Failed to mark notification as read', 500);
        }
    }
    async markAllAsRead(userId) {
        try {
            await database_1.prisma.notifications.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            });
        }
        catch (error) {
            logger_1.logger.error('Mark all notifications as read error:', error);
            throw (0, errorHandler_1.createError)('Failed to mark all notifications as read', 500);
        }
    }
    // Private helper methods
    sendRealTimeNotification(userId, notification) {
        try {
            const io = (0, io_1.getIO)();
            io.to(`user_${userId}`).emit('notification', notification);
        }
        catch (error) {
            logger_1.logger.error('Send real-time notification error:', error);
        }
    }
    async sendEmailNotification(data) {
        try {
            const user = await database_1.prisma.users.findUnique({
                where: { id: data.userId },
                select: { email: true, name: true }
            });
            if (!user)
                return;
            // Use the correct EmailService method
            await this.emailService.sendEmail({
                to: user.email,
                subject: data.title,
                text: data.message
            });
        }
        catch (error) {
            logger_1.logger.error('Send email notification error:', error);
        }
    }
    getBookingNotificationMessages(type, booking) {
        const eventTitle = booking.events.title;
        const professionalName = booking.creative_profiles.users.name;
        switch (type) {
            case client_1.NotificationType.BOOKING_REQUEST:
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
    getEventNotificationMessages(type, event) {
        const eventTitle = event.title;
        switch (type) {
            case client_1.NotificationType.EVENT_REMINDER:
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
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=NotificationService.js.map