"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = exports.AppEvents = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const NotificationService_1 = require("./NotificationService");
const EmailService_1 = require("./EmailService");
const CacheService_1 = require("./CacheService");
// Define application events
var AppEvents;
(function (AppEvents) {
    // users events
    AppEvents["USER_REGISTERED"] = "user.registered";
    AppEvents["USER_PROFILE_UPDATED"] = "user.profile.updated";
    AppEvents["USER_DEACTIVATED"] = "user.deactivated";
    // Event events
    AppEvents["EVENT_CREATED"] = "event.created";
    AppEvents["EVENT_UPDATED"] = "event.updated";
    AppEvents["EVENT_PUBLISHED"] = "event.published";
    AppEvents["EVENT_CANCELLED"] = "event.cancelled";
    // Application events
    AppEvents["APPLICATION_SUBMITTED"] = "application.submitted";
    AppEvents["APPLICATION_ACCEPTED"] = "application.accepted";
    AppEvents["APPLICATION_REJECTED"] = "application.rejected";
    // Booking events
    AppEvents["BOOKING_CREATED"] = "bookings.created";
    AppEvents["BOOKING_CONFIRMED"] = "bookings.confirmed";
    AppEvents["BOOKING_CANCELLED"] = "bookings.cancelled";
    AppEvents["BOOKING_COMPLETED"] = "bookings.completed";
    // Review events
    AppEvents["REVIEW_CREATED"] = "review.created";
    AppEvents["REVIEW_UPDATED"] = "review.updated";
    // Message events
    AppEvents["MESSAGE_SENT"] = "message.sent";
    AppEvents["MESSAGE_RECEIVED"] = "message.received";
    // System events
    AppEvents["SYSTEM_ERROR"] = "system.error";
    AppEvents["CACHE_INVALIDATED"] = "cache.invalidated";
})(AppEvents || (exports.AppEvents = AppEvents = {}));
class EventBus extends events_1.EventEmitter {
    constructor() {
        super();
        this.notificationService = new NotificationService_1.NotificationService();
        this.emailService = new EmailService_1.EmailService();
        this.cacheService = new CacheService_1.CacheService();
        this.setupEventHandlers();
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    // Emit an application event
    emitEvent(eventType, payload) {
        try {
            logger_1.logger.info('Event emitted', {
                eventType,
                entityId: payload.entityId,
                userId: payload.userId,
                source: payload.source
            });
            this.emit(eventType, payload);
        }
        catch (error) {
            logger_1.logger.error('Error emitting event', { eventType, payload, error });
        }
    }
    setupEventHandlers() {
        // users events
        this.on(AppEvents.USER_REGISTERED, this.handleusersRegistered.bind(this));
        this.on(AppEvents.USER_PROFILE_UPDATED, this.handleusersProfileUpdated.bind(this));
        // Event events
        this.on(AppEvents.EVENT_CREATED, this.handleEventCreated.bind(this));
        this.on(AppEvents.EVENT_PUBLISHED, this.handleEventPublished.bind(this));
        this.on(AppEvents.EVENT_CANCELLED, this.handleEventCancelled.bind(this));
        // Application events
        this.on(AppEvents.APPLICATION_SUBMITTED, this.handleApplicationSubmitted.bind(this));
        this.on(AppEvents.APPLICATION_ACCEPTED, this.handleApplicationAccepted.bind(this));
        this.on(AppEvents.APPLICATION_REJECTED, this.handleApplicationRejected.bind(this));
        // Booking events
        this.on(AppEvents.BOOKING_CREATED, this.handleBookingCreated.bind(this));
        this.on(AppEvents.BOOKING_CONFIRMED, this.handleBookingConfirmed.bind(this));
        this.on(AppEvents.BOOKING_CANCELLED, this.handleBookingCancelled.bind(this));
        this.on(AppEvents.BOOKING_COMPLETED, this.handleBookingCompleted.bind(this));
        // Review events
        this.on(AppEvents.REVIEW_CREATED, this.handleReviewCreated.bind(this));
        // Message events
        this.on(AppEvents.MESSAGE_SENT, this.handleMessageSent.bind(this));
        // Cache invalidation
        this.on(AppEvents.CACHE_INVALIDATED, this.handleCacheInvalidated.bind(this));
        // Error handling
        this.on('error', this.handleError.bind(this));
    }
    // Event handlers
    async handleusersRegistered(payload) {
        try {
            const { data } = payload;
            // Send welcome notification
            await this.notificationService.sendNotification({
                userId: payload.userId,
                type: 'SYSTEM_ANNOUNCEMENT',
                title: 'Welcome to CollabBridge!',
                message: 'Your account has been created successfully. Complete your profile to get started.',
                metadata: { onboarding: true },
                priority: 'normal',
                sendEmail: true
            });
            // Send welcome email
            await this.emailService.sendWelcomeEmail(data.email, data.name);
            logger_1.logger.info('users registration event processed', { userId: payload.userId });
        }
        catch (error) {
            logger_1.logger.error('Error handling user registered event', error);
        }
    }
    async handleusersProfileUpdated(payload) {
        try {
            // Invalidate user cache
            await this.cacheService.invalidateusersCache(payload.userId);
            logger_1.logger.info('users profile updated event processed', { userId: payload.userId });
        }
        catch (error) {
            logger_1.logger.error('Error handling user profile updated event', error);
        }
    }
    async handleEventCreated(payload) {
        try {
            // Invalidate event-related caches
            await this.cacheService.invalidateEventCache(payload.entityId);
            logger_1.logger.info('Event created event processed', { eventId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling event created event', error);
        }
    }
    async handleEventPublished(payload) {
        try {
            const { data } = payload;
            // Notify potential professionals based on event requirements
            // This would typically involve finding professionals with matching skills
            // For now, we'll just log the event
            await this.cacheService.invalidateEventCache(payload.entityId);
            logger_1.logger.info('Event published event processed', { eventId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling event published event', error);
        }
    }
    async handleEventCancelled(payload) {
        try {
            const { data } = payload;
            // Notify all applicants about cancellation
            if (data.applicants) {
                for (const applicant of data.applicants) {
                    await this.notificationService.sendNotification({
                        userId: applicant.userId,
                        type: 'EVENT_REMINDER',
                        title: 'Event Cancelled',
                        message: `The event "${data.title}" has been cancelled.`,
                        metadata: { eventId: payload.entityId },
                        priority: 'high',
                        sendEmail: true
                    });
                }
            }
            await this.cacheService.invalidateEventCache(payload.entityId);
            logger_1.logger.info('Event cancelled event processed', { eventId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling event cancelled event', error);
        }
    }
    async handleApplicationSubmitted(payload) {
        try {
            const { data } = payload;
            // Notify event planner about new application
            await this.notificationService.sendNotification({
                userId: data.event_planners.userId,
                type: 'APPLICATION_UPDATE',
                title: 'New Application Received',
                message: `${data.creative_profiles.name} applied for your event "${data.events.title}".`,
                metadata: {
                    applicationId: payload.entityId,
                    eventId: data.events.id,
                    professionalId: data.creative_profiles.id
                },
                priority: 'normal',
                sendEmail: true
            });
            logger_1.logger.info('Application submitted event processed', { applicationId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling application submitted event', error);
        }
    }
    async handleApplicationAccepted(payload) {
        try {
            const { data } = payload;
            // Notify professional about acceptance
            await this.notificationService.sendNotification({
                userId: data.creative_profiles.userId,
                type: 'APPLICATION_UPDATE',
                title: 'Application Accepted!',
                message: `Your application for "${data.events.title}" has been accepted.`,
                metadata: {
                    applicationId: payload.entityId,
                    eventId: data.events.id
                },
                priority: 'high',
                sendEmail: true
            });
            logger_1.logger.info('Application accepted event processed', { applicationId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling application accepted event', error);
        }
    }
    async handleApplicationRejected(payload) {
        try {
            const { data } = payload;
            // Notify professional about rejection
            await this.notificationService.sendNotification({
                userId: data.creative_profiles.userId,
                type: 'APPLICATION_UPDATE',
                title: 'Application Update',
                message: `Thank you for your interest in "${data.events.title}". We've decided to move forward with other candidates.`,
                metadata: {
                    applicationId: payload.entityId,
                    eventId: data.events.id
                },
                priority: 'normal',
                sendEmail: false
            });
            logger_1.logger.info('Application rejected event processed', { applicationId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling application rejected event', error);
        }
    }
    async handleBookingCreated(payload) {
        try {
            const { data } = payload;
            // Notify professional about new booking
            await this.notificationService.sendNotification({
                userId: data.creative_profiles.userId,
                type: 'BOOKING_REQUEST',
                title: 'New Booking Request',
                message: `You have a new booking request for "${data.events.title}".`,
                metadata: {
                    bookingId: payload.entityId,
                    eventId: data.events.id
                },
                priority: 'high',
                sendEmail: true
            });
            // Invalidate booking caches
            await this.cacheService.deletePattern(`user:bookings:${data.creative_profiles.userId}:*`);
            await this.cacheService.deletePattern(`user:bookings:${data.event_planners.userId}:*`);
            logger_1.logger.info('Booking created event processed', { bookingId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling booking created event', error);
        }
    }
    async handleBookingConfirmed(payload) {
        try {
            const { data } = payload;
            // Notify both parties about confirmation
            await Promise.all([
                this.notificationService.sendNotification({
                    userId: data.creative_profiles.userId,
                    type: 'BOOKING_REQUEST',
                    title: 'Booking Confirmed',
                    message: `Your booking for "${data.events.title}" has been confirmed.`,
                    metadata: { bookingId: payload.entityId },
                    priority: 'high',
                    sendEmail: true
                }),
                this.notificationService.sendNotification({
                    userId: data.event_planners.userId,
                    type: 'BOOKING_REQUEST',
                    title: 'Booking Confirmed',
                    message: `Booking with ${data.creative_profiles.name} for "${data.events.title}" is confirmed.`,
                    metadata: { bookingId: payload.entityId },
                    priority: 'normal',
                    sendEmail: true
                })
            ]);
            logger_1.logger.info('Booking confirmed event processed', { bookingId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling booking confirmed event', error);
        }
    }
    async handleBookingCancelled(payload) {
        try {
            const { data } = payload;
            // Notify both parties about cancellation
            const otherusersId = data.cancelledBy === data.creative_profiles.userId
                ? data.event_planners.userId
                : data.creative_profiles.userId;
            await this.notificationService.sendNotification({
                userId: otherusersId,
                type: 'BOOKING_REQUEST',
                title: 'Booking Cancelled',
                message: `The booking for "${data.events.title}" has been cancelled.`,
                metadata: {
                    bookingId: payload.entityId,
                    reason: data.cancellationReason
                },
                priority: 'high',
                sendEmail: true
            });
            logger_1.logger.info('Booking cancelled event processed', { bookingId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling booking cancelled event', error);
        }
    }
    async handleBookingCompleted(payload) {
        try {
            const { data } = payload;
            // Notify both parties and prompt for reviews
            await Promise.all([
                this.notificationService.sendNotification({
                    userId: data.creative_profiles.userId,
                    type: 'BOOKING_REQUEST',
                    title: 'Booking Completed - Leave a Review',
                    message: `Your booking for "${data.events.title}" is complete. Please leave a review.`,
                    metadata: { bookingId: payload.entityId, actionRequired: 'review' },
                    priority: 'normal',
                    sendEmail: false
                }),
                this.notificationService.sendNotification({
                    userId: data.event_planners.userId,
                    type: 'BOOKING_REQUEST',
                    title: 'Booking Completed - Leave a Review',
                    message: `Booking with ${data.creative_profiles.name} is complete. Please leave a review.`,
                    metadata: { bookingId: payload.entityId, actionRequired: 'review' },
                    priority: 'normal',
                    sendEmail: false
                })
            ]);
            logger_1.logger.info('Booking completed event processed', { bookingId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling booking completed event', error);
        }
    }
    async handleReviewCreated(payload) {
        try {
            const { data } = payload;
            // Notify reviewee about new review
            await this.notificationService.sendNotification({
                userId: data.reviewee.id,
                type: 'REVIEW_RECEIVED',
                title: 'New Review Received',
                message: `You received a ${data.rating}-star review from ${data.reviewer.name}.`,
                metadata: {
                    reviewId: payload.entityId,
                    bookingId: data.bookings.id,
                    rating: data.rating
                },
                priority: 'normal',
                sendEmail: false
            });
            // Invalidate user cache for rating updates
            await this.cacheService.invalidateusersCache(data.reviewee.id);
            logger_1.logger.info('Review created event processed', { reviewId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling review created event', error);
        }
    }
    async handleMessageSent(payload) {
        try {
            const { data } = payload;
            // Real-time notification would be handled by Socket.IO
            // This is just for logging and potential email notifications
            logger_1.logger.info('Message sent event processed', { messageId: payload.entityId });
        }
        catch (error) {
            logger_1.logger.error('Error handling message sent event', error);
        }
    }
    async handleCacheInvalidated(payload) {
        try {
            logger_1.logger.info('Cache invalidated', {
                pattern: payload.data.pattern,
                reason: payload.data.reason
            });
        }
        catch (error) {
            logger_1.logger.error('Error handling cache invalidated event', error);
        }
    }
    handleError(error) {
        logger_1.logger.error('EventBus error', error);
    }
}
exports.EventBus = EventBus;
// Export singleton instance
exports.eventBus = EventBus.getInstance();
//# sourceMappingURL=EventBus.js.map