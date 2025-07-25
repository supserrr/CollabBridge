"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = exports.BookingService = exports.BookingStatus = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const NotificationService_1 = require("./NotificationService");
const EmailService_1 = require("./EmailService");
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
class BookingService {
    constructor() {
        this.notificationService = new NotificationService_1.NotificationService();
        this.emailService = new EmailService_1.EmailService();
    }
    async createBooking(eventId, professionalId, plannerusersId, bookingData) {
        try {
            // Validate event exists and is accessible
            const event = await database_1.prisma.events.findUnique({
                where: { id: eventId },
                include: {
                    event_planners: { include: { users: true } },
                    _count: { select: { bookings: true } }
                }
            });
            if (!event || event.event_planners.userId !== plannerusersId) {
                throw (0, errorHandler_1.createError)('Event not found or access denied', 403);
            }
            // Validate professional exists and is active
            const professional = await database_1.prisma.creative_profiles.findUnique({
                where: { id: professionalId },
                include: { users: true }
            });
            if (!professional || !professional.users.isActive) {
                throw (0, errorHandler_1.createError)('Professional not found or inactive', 404);
            }
            // Check for existing active booking
            const existingBooking = await database_1.prisma.bookings.findFirst({
                where: {
                    eventId,
                    professionalId,
                    status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] }
                }
            });
            if (existingBooking) {
                throw (0, errorHandler_1.createError)('Active booking already exists for this professional', 409);
            }
            // Validate date overlap
            const hasDateConflict = await this.checkDateConflict(professionalId, bookingData.startDate, bookingData.endDate);
            if (hasDateConflict) {
                throw (0, errorHandler_1.createError)('Professional has conflicting bookings for these dates', 409);
            }
            // Create booking with transaction
            return await database_1.prisma.$transaction(async (tx) => {
                const booking = await tx.bookings.create({
                    data: {
                        eventId,
                        professionalId,
                        eventPlannerId: event.event_planners.id,
                        userId: plannerusersId,
                        startDate: bookingData.startDate,
                        endDate: bookingData.endDate,
                        rate: bookingData.rate,
                        currency: bookingData.currency || 'USD',
                        description: bookingData.description,
                        requirements: bookingData.requirements || [],
                        notes: bookingData.notes,
                        status: BookingStatus.PENDING,
                    },
                    include: {
                        events: true,
                        creative_profiles: { include: { users: true } },
                        event_planners: { include: { users: true } }
                    }
                });
                // Send notification to professional
                await this.notificationService.sendNotification({
                    userId: professional.userId,
                    type: 'BOOKING_REQUEST',
                    title: 'New Booking Request',
                    message: `You have a new booking request for ${event.title}`,
                    metadata: {
                        bookingId: booking.id,
                        eventId,
                        eventTitle: event.title,
                        plannerName: event.event_planners.users.name
                    },
                    priority: 'high',
                    sendEmail: true
                });
                // Send email notification
                await this.emailService.sendBookingNotification(professional.users.email, professional.users.name, event.title, `${process.env.FRONTEND_URL}/bookings/${booking.id}`);
                logger_1.logger.info('Booking created successfully', {
                    bookingId: booking.id,
                    eventId,
                    professionalId,
                    plannerId: plannerusersId
                });
                return booking;
            });
        }
        catch (error) {
            logger_1.logger.error('Create booking error:', error);
            throw error;
        }
    }
    async updateBookingStatus(bookingId, userId, statusData) {
        try {
            const booking = await database_1.prisma.bookings.findUnique({
                where: { id: bookingId },
                include: {
                    event_planners: { include: { users: true } },
                    creative_profiles: { include: { users: true } },
                    events: true
                }
            });
            if (!booking) {
                throw (0, errorHandler_1.createError)('Booking not found', 404);
            }
            // Verify user authorization
            const isPlanner = booking.event_planners.userId === userId;
            const isProfessional = booking.creative_profiles.userId === userId;
            if (!isPlanner && !isProfessional) {
                throw (0, errorHandler_1.createError)('Not authorized to update this booking', 403);
            }
            // Business logic for status transitions
            const validTransitions = this.getValidStatusTransitions(booking.status, isPlanner, isProfessional);
            if (!validTransitions.includes(statusData.status)) {
                throw (0, errorHandler_1.createError)(`Cannot transition from ${booking.status} to ${statusData.status}`, 400);
            }
            return await database_1.prisma.$transaction(async (tx) => {
                const updatedBooking = await tx.bookings.update({
                    where: { id: bookingId },
                    data: {
                        status: statusData.status,
                        notes: statusData.notes,
                        cancellationReason: statusData.cancellationReason,
                        confirmedAt: statusData.status === BookingStatus.CONFIRMED ? new Date() : booking.confirmedAt,
                        completedAt: statusData.status === BookingStatus.COMPLETED ? new Date() : booking.completedAt,
                        cancelledAt: statusData.status === BookingStatus.CANCELLED ? new Date() : booking.cancelledAt,
                    },
                    include: {
                        events: true,
                        creative_profiles: { include: { users: true } },
                        event_planners: { include: { users: true } }
                    }
                });
                // Send status update notification
                const recipientId = isPlanner ? booking.creative_profiles.userId : booking.event_planners.userId;
                const recipientName = isPlanner ? booking.creative_profiles.users.name : booking.event_planners.users.name;
                await this.notificationService.sendNotification({
                    userId: recipientId,
                    type: 'BOOKING_REQUEST',
                    title: 'Booking Status Updated',
                    message: `Booking for ${booking.events.title} is now ${statusData.status.toLowerCase()}`,
                    metadata: {
                        bookingId,
                        status: statusData.status,
                        eventTitle: booking.events.title
                    },
                    priority: 'normal',
                    sendEmail: true
                });
                // Send email notification for important status changes
                if ([BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED].includes(statusData.status)) {
                    const recipient = isPlanner ? booking.creative_profiles.users : booking.event_planners.users;
                    await this.emailService.sendBookingNotification(recipient.email, recipient.name, booking.events.title, `${process.env.FRONTEND_URL}/bookings/${bookingId}`);
                }
                logger_1.logger.info('Booking status updated', {
                    bookingId,
                    oldStatus: booking.status,
                    newStatus: statusData.status,
                    updatedBy: userId
                });
                return updatedBooking;
            });
        }
        catch (error) {
            logger_1.logger.error('Update booking status error:', error);
            throw error;
        }
    }
    async getBookingsByusers(userId, userRole, filters = {}) {
        try {
            const { page = 1, limit = 12, status } = filters;
            const skip = (page - 1) * limit;
            let where = {};
            if (userRole === 'EVENT_PLANNER') {
                const eventPlanner = await database_1.prisma.event_planners.findUnique({
                    where: { userId },
                });
                if (eventPlanner) {
                    where.eventPlannerId = eventPlanner.id;
                }
                else {
                    return { bookings: [], pagination: this.buildPagination(0, page, limit) };
                }
            }
            else if (userRole === 'CREATIVE_PROFESSIONAL') {
                const creativeProfile = await database_1.prisma.creative_profiles.findUnique({
                    where: { userId },
                });
                if (creativeProfile) {
                    where.professionalId = creativeProfile.id;
                }
                else {
                    return { bookings: [], pagination: this.buildPagination(0, page, limit) };
                }
            }
            if (status)
                where.status = status;
            const [bookings, total] = await Promise.all([
                database_1.prisma.bookings.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        events: {
                            select: {
                                id: true,
                                title: true,
                                eventType: true,
                                location: true,
                                startDate: true,
                                endDate: true,
                            },
                        },
                        creative_profiles: {
                            include: {
                                users: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                        event_planners: {
                            include: {
                                users: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                }),
                database_1.prisma.bookings.count({ where }),
            ]);
            return {
                bookings,
                pagination: this.buildPagination(total, page, limit),
            };
        }
        catch (error) {
            logger_1.logger.error('Get bookings by user error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch bookings', 500);
        }
    }
    async getBookingById(bookingId, userId) {
        try {
            const booking = await database_1.prisma.bookings.findUnique({
                where: { id: bookingId },
                include: {
                    events: {
                        include: {
                            event_planners: { include: { users: true } }
                        }
                    },
                    creative_profiles: { include: { users: true } },
                    event_planners: { include: { users: true } },
                    reviews: {
                        include: {
                            users_reviews_reviewerIdTousers: {
                                select: { id: true, name: true, avatar: true }
                            }
                        }
                    }
                }
            });
            if (!booking) {
                throw (0, errorHandler_1.createError)('Booking not found', 404);
            }
            // Check authorization
            const isPlanner = booking.event_planners.userId === userId;
            const isProfessional = booking.creative_profiles.userId === userId;
            if (!isPlanner && !isProfessional) {
                throw (0, errorHandler_1.createError)('Not authorized to view this booking', 403);
            }
            return booking;
        }
        catch (error) {
            logger_1.logger.error('Get booking by ID error:', error);
            throw error;
        }
    }
    async checkDateConflict(professionalId, startDate, endDate) {
        const conflictingBookings = await database_1.prisma.bookings.findMany({
            where: {
                professionalId,
                status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
                OR: [
                    {
                        startDate: { lte: endDate },
                        endDate: { gte: startDate }
                    }
                ]
            }
        });
        return conflictingBookings.length > 0;
    }
    getValidStatusTransitions(currentStatus, isPlanner, isProfessional) {
        const transitions = {
            [BookingStatus.PENDING]: {
                planner: [BookingStatus.CANCELLED],
                professional: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED]
            },
            [BookingStatus.CONFIRMED]: {
                planner: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
                professional: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED]
            },
            [BookingStatus.IN_PROGRESS]: {
                planner: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
                professional: [BookingStatus.COMPLETED]
            },
            [BookingStatus.COMPLETED]: {
                planner: [],
                professional: []
            },
            [BookingStatus.CANCELLED]: {
                planner: [],
                professional: []
            }
        };
        return isPlanner ? transitions[currentStatus].planner : transitions[currentStatus].professional;
    }
    buildPagination(total, page, limit) {
        const pages = Math.ceil(total / limit);
        return {
            page,
            limit,
            total,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1,
        };
    }
    async getBookingStatistics(userId, userRole) {
        try {
            let where = {};
            if (userRole === 'EVENT_PLANNER') {
                const eventPlanner = await database_1.prisma.event_planners.findUnique({
                    where: { userId },
                });
                if (eventPlanner) {
                    where.eventPlannerId = eventPlanner.id;
                }
            }
            else if (userRole === 'CREATIVE_PROFESSIONAL') {
                const creativeProfile = await database_1.prisma.creative_profiles.findUnique({
                    where: { userId },
                });
                if (creativeProfile) {
                    where.professionalId = creativeProfile.id;
                }
            }
            const [totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, totalRevenue] = await Promise.all([
                database_1.prisma.bookings.count({ where }),
                database_1.prisma.bookings.count({ where: { ...where, status: BookingStatus.PENDING } }),
                database_1.prisma.bookings.count({ where: { ...where, status: BookingStatus.CONFIRMED } }),
                database_1.prisma.bookings.count({ where: { ...where, status: BookingStatus.COMPLETED } }),
                database_1.prisma.bookings.count({ where: { ...where, status: BookingStatus.CANCELLED } }),
                database_1.prisma.bookings.aggregate({
                    where: { ...where, status: BookingStatus.COMPLETED },
                    _sum: { rate: true }
                })
            ]);
            return {
                totalBookings,
                pendingBookings,
                confirmedBookings,
                completedBookings,
                cancelledBookings,
                totalRevenue: totalRevenue._sum.rate || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Get booking statistics error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch booking statistics', 500);
        }
    }
}
exports.BookingService = BookingService;
exports.bookingService = new BookingService();
//# sourceMappingURL=BookingService.js.map