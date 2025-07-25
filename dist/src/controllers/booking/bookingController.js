"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const errors_1 = require("../../utils/errors");
const BookingService_1 = require("../../services/BookingService");
const EventBus_1 = require("../../services/EventBus");
class BookingController {
    async createBooking(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errors_1.HttpError('users not authenticated', 401);
            }
            const { eventId } = req.params;
            // Get professional profile for the user
            const professional = await database_1.prisma.creative_profiles.findUnique({
                where: { userId }
            });
            if (!professional) {
                throw new errors_1.HttpError('Creative professional profile not found', 404);
            }
            const bookingData = {
                eventId,
                professionalId: professional.id,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
                rate: req.body.rate,
                description: req.body.description,
                requirements: req.body.requirements || [],
            };
            const booking = await BookingService_1.bookingService.createBooking(eventId, professional.id, userId, bookingData);
            // Emit booking created event
            EventBus_1.eventBus.emitEvent(EventBus_1.AppEvents.BOOKING_CREATED, {
                userId,
                entityId: booking.id,
                entityType: 'booking',
                data: booking,
                timestamp: new Date(),
                source: 'BookingController.createBooking'
            });
            res.status(201).json(booking);
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
    async getBookings(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 12, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            let where = {};
            if (req.user.role === 'EVENT_PLANNER') {
                const eventPlanner = await database_1.prisma.event_planners.findUnique({
                    where: { userId },
                });
                if (eventPlanner) {
                    where.eventPlannerId = eventPlanner.id;
                }
            }
            else if (req.user.role === 'CREATIVE_PROFESSIONAL') {
                const creativeProfile = await database_1.prisma.creative_profiles.findUnique({
                    where: { userId },
                });
                if (creativeProfile) {
                    where.professionalId = creativeProfile.id;
                }
            }
            if (status)
                where.status = status;
            const [bookings, total] = await Promise.all([
                database_1.prisma.bookings.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        events: {
                            select: {
                                id: true,
                                title: true,
                                eventType: true,
                                location: true,
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
            res.json({
                success: true,
                bookings,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async updateBookingStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const booking = await database_1.prisma.bookings.findUnique({
                where: { id },
                include: {
                    events: true,
                    creative_profiles: {
                        include: { users: true },
                    },
                    event_planners: {
                        include: { users: true },
                    },
                },
            });
            if (!booking) {
                throw new errors_1.HttpError('Booking not found', 404);
            }
            // Check authorization
            const isPlanner = booking.event_planners.users.id === req.user.id;
            const isCreative = booking.creative_profiles.users.id === req.user.id;
            if (!isPlanner && !isCreative) {
                throw new errors_1.HttpError('Not authorized to update this booking', 403);
            }
            const updatedBooking = await database_1.prisma.bookings.update({
                where: { id },
                data: {
                    status,
                    notes,
                    confirmedAt: status === client_1.BookingStatus.CONFIRMED ? new Date() : booking.confirmedAt,
                    completedAt: status === client_1.BookingStatus.COMPLETED ? new Date() : booking.completedAt,
                    cancelledAt: status === client_1.BookingStatus.CANCELLED ? new Date() : booking.cancelledAt,
                },
            });
            res.json({
                success: true,
                message: 'Booking status updated successfully',
                booking: updatedBooking
            });
        }
        catch (error) {
            throw error;
        }
    }
    async updateBooking(req, res) {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            throw new errors_1.HttpError('users not authenticated', 401);
        }
        const booking = await database_1.prisma.bookings.findUnique({
            where: { id },
            include: {
                event_planners: true,
                creative_profiles: true
            }
        });
        if (!booking) {
            throw new errors_1.HttpError('Booking not found', 404);
        }
        // Check if user is authorized to update this booking
        if (booking.event_planners.userId !== userId && booking.creative_profiles.userId !== userId) {
            throw new errors_1.HttpError('Not authorized to update this booking', 403);
        }
        const updatedBooking = await database_1.prisma.bookings.update({
            where: { id },
            data: req.body,
            include: {
                events: true,
                event_planners: true,
                creative_profiles: true
            }
        });
        res.json(updatedBooking);
    }
    async getBooking(req, res) {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            throw new errors_1.HttpError('users not authenticated', 401);
        }
        const booking = await database_1.prisma.bookings.findUnique({
            where: { id },
            include: {
                events: true,
                event_planners: true,
                creative_profiles: true
            }
        });
        if (!booking) {
            throw new errors_1.HttpError('Booking not found', 404);
        }
        // Check if user is authorized to view this booking
        if (booking.event_planners.userId !== userId && booking.creative_profiles.userId !== userId) {
            throw new errors_1.HttpError('Not authorized to view this booking', 403);
        }
        res.json(booking);
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=bookingController.js.map