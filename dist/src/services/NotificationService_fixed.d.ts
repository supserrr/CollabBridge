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
export declare class NotificationService {
    private emailService;
    constructor();
    sendNotification(data: NotificationData): Promise<void>;
    sendBookingNotification(userId: string, type: NotificationType, bookingId: string, additionalData?: any): Promise<void>;
    sendEventNotification(userId: string, type: NotificationType, eventId: string, additionalData?: any): Promise<void>;
    sendMessageNotification(recipientId: string, senderId: string, conversationId: string, messagePreview: string): Promise<void>;
    sendReviewNotification(userId: string, reviewId: string, reviewerName: string, rating: number): Promise<void>;
    sendReminderNotifications(): Promise<void>;
    getUsersNotifications(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        notifications: {
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
            title: string;
            isRead: boolean;
            readAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    private sendRealTimeNotification;
    private sendEmailNotification;
    private getBookingNotificationMessages;
    private getEventNotificationMessages;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=NotificationService_fixed.d.ts.map