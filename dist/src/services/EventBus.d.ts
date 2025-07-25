import { EventEmitter } from 'events';
export declare enum AppEvents {
    USER_REGISTERED = "user.registered",
    USER_PROFILE_UPDATED = "user.profile.updated",
    USER_DEACTIVATED = "user.deactivated",
    EVENT_CREATED = "event.created",
    EVENT_UPDATED = "event.updated",
    EVENT_PUBLISHED = "event.published",
    EVENT_CANCELLED = "event.cancelled",
    APPLICATION_SUBMITTED = "application.submitted",
    APPLICATION_ACCEPTED = "application.accepted",
    APPLICATION_REJECTED = "application.rejected",
    BOOKING_CREATED = "bookings.created",
    BOOKING_CONFIRMED = "bookings.confirmed",
    BOOKING_CANCELLED = "bookings.cancelled",
    BOOKING_COMPLETED = "bookings.completed",
    REVIEW_CREATED = "review.created",
    REVIEW_UPDATED = "review.updated",
    MESSAGE_SENT = "message.sent",
    MESSAGE_RECEIVED = "message.received",
    SYSTEM_ERROR = "system.error",
    CACHE_INVALIDATED = "cache.invalidated"
}
export interface EventPayload {
    userId?: string;
    entityId: string;
    entityType: string;
    data: any;
    timestamp: Date;
    source: string;
}
export declare class EventBus extends EventEmitter {
    private static instance;
    private notificationService;
    private emailService;
    private cacheService;
    constructor();
    static getInstance(): EventBus;
    emitEvent(eventType: AppEvents, payload: EventPayload): void;
    private setupEventHandlers;
    private handleusersRegistered;
    private handleusersProfileUpdated;
    private handleEventCreated;
    private handleEventPublished;
    private handleEventCancelled;
    private handleApplicationSubmitted;
    private handleApplicationAccepted;
    private handleApplicationRejected;
    private handleBookingCreated;
    private handleBookingConfirmed;
    private handleBookingCancelled;
    private handleBookingCompleted;
    private handleReviewCreated;
    private handleMessageSent;
    private handleCacheInvalidated;
    private handleError;
}
export declare const eventBus: EventBus;
//# sourceMappingURL=EventBus.d.ts.map