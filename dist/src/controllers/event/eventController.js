"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const database_1 = require("../../config/database");
const errorHandler_1 = require("../../middleware/errorHandler");
const client_1 = require("@prisma/client");
class EventController {
    async createEvent(req, res) {
        try {
            const userId = req.user.id;
            const { title, description, eventType, startDate, endDate, location, address, budget, currency = 'USD', requiredRoles, tags = [], maxApplicants, isPublic = true, requirements, deadlineDate, } = req.body;
            // Get event planner profile
            const eventPlanner = await database_1.prisma.event_planners.findUnique({
                where: { userId },
            });
            if (!eventPlanner) {
                throw (0, errorHandler_1.createError)('Event planner profile not found', 404);
            }
            const event = await database_1.prisma.events.create({
                data: {
                    creatorId: userId,
                    eventPlannerId: eventPlanner.id,
                    title,
                    description,
                    eventType,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    location,
                    address,
                    budget,
                    currency,
                    requiredRoles,
                    tags,
                    maxApplicants,
                    isPublic,
                    requirements,
                    deadlineDate: deadlineDate ? new Date(deadlineDate) : null,
                    status: client_1.EventStatus.DRAFT,
                },
                include: {
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
            });
            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                event,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getEvents(req, res) {
        try {
            const { page = 1, limit = 12, eventType, location, budgetMin, budgetMax, dateFrom, dateTo, requiredRoles, search, } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {
                status: client_1.EventStatus.PUBLISHED,
                isPublic: true,
                startDate: { gte: new Date() },
            };
            if (eventType)
                where.eventType = eventType;
            if (location)
                where.location = { contains: location, mode: 'insensitive' };
            if (budgetMin || budgetMax) {
                where.budget = {};
                if (budgetMin)
                    where.budget.gte = Number(budgetMin);
                if (budgetMax)
                    where.budget.lte = Number(budgetMax);
            }
            if (dateFrom)
                where.startDate.gte = new Date(dateFrom);
            if (dateTo)
                where.startDate.lte = new Date(dateTo);
            if (requiredRoles) {
                const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
                where.requiredRoles = { hasSome: roles };
            }
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }
            const [events, total] = await Promise.all([
                database_1.prisma.events.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: [
                        { isFeatured: 'desc' },
                        { startDate: 'asc' },
                    ],
                    include: {
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
                        _count: {
                            select: {
                                event_applications: true,
                            },
                        },
                    },
                }),
                database_1.prisma.events.count({ where }),
            ]);
            res.json({
                success: true,
                events,
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
    async getEventById(req, res) {
        try {
            const { id } = req.params;
            const event = await database_1.prisma.events.findUnique({
                where: { id },
                include: {
                    event_planners: {
                        include: {
                            users: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                    location: true,
                                },
                            },
                        },
                    },
                    event_applications: {
                        include: {
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
                        },
                    },
                    _count: {
                        select: {
                            event_applications: true,
                            bookings: true,
                        },
                    },
                },
            });
            if (!event) {
                throw (0, errorHandler_1.createError)('Event not found', 404);
            }
            // Check if user can view this event
            const canView = event.isPublic ||
                event.eventPlannerId === req.user.id ||
                req.user.role === 'ADMIN';
            if (!canView) {
                throw (0, errorHandler_1.createError)('Not authorized to view this event', 403);
            }
            res.json({
                success: true,
                event,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            // Verify ownership
            const event = await database_1.prisma.events.findUnique({
                where: { id },
                include: { event_planners: true },
            });
            if (!event) {
                throw (0, errorHandler_1.createError)('Event not found', 404);
            }
            if (event.eventPlannerId !== userId) {
                throw (0, errorHandler_1.createError)('Not authorized to update this event', 403);
            }
            const updatedEvent = await database_1.prisma.events.update({
                where: { id },
                data: req.body,
                include: {
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
            });
            res.json({
                success: true,
                message: 'Event updated successfully',
                event: updatedEvent,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            // Verify ownership
            const event = await database_1.prisma.events.findUnique({
                where: { id },
                include: { event_planners: true },
            });
            if (!event) {
                throw (0, errorHandler_1.createError)('Event not found', 404);
            }
            if (event.eventPlannerId !== userId) {
                throw (0, errorHandler_1.createError)('Not authorized to delete this event', 403);
            }
            await database_1.prisma.events.delete({
                where: { id },
            });
            res.json({
                success: true,
                message: 'Event deleted successfully',
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getMyEvents(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 12, status } = req.query;
            const eventPlanner = await database_1.prisma.event_planners.findUnique({
                where: { userId },
            });
            if (!eventPlanner) {
                throw (0, errorHandler_1.createError)('Event planner profile not found', 404);
            }
            const skip = (Number(page) - 1) * Number(limit);
            const where = { eventPlannerId: eventPlanner.id };
            if (status)
                where.status = status;
            const [events, total] = await Promise.all([
                database_1.prisma.events.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: {
                            select: {
                                event_applications: true,
                                bookings: true,
                            },
                        },
                    },
                }),
                database_1.prisma.events.count({ where }),
            ]);
            res.json({
                success: true,
                events,
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
    async applyToEvent(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { message, proposedRate, availability, portfolio } = req.body;
            // Get creative profile
            const creativeProfile = await database_1.prisma.creative_profiles.findUnique({
                where: { userId },
            });
            if (!creativeProfile) {
                throw (0, errorHandler_1.createError)('Creative professional profile not found', 404);
            }
            // Verify event exists and is open for applications
            const event = await database_1.prisma.events.findUnique({
                where: { id },
            });
            if (!event) {
                throw (0, errorHandler_1.createError)('Event not found', 404);
            }
            if (event.status !== client_1.EventStatus.PUBLISHED) {
                throw (0, errorHandler_1.createError)('Event is not open for applications', 400);
            }
            // Check if already applied
            const existingApplication = await database_1.prisma.event_applications.findUnique({
                where: {
                    eventId_professionalId: {
                        eventId: id,
                        professionalId: creativeProfile.id,
                    },
                },
            });
            if (existingApplication) {
                throw (0, errorHandler_1.createError)('Already applied to this event', 409);
            }
            const application = await database_1.prisma.event_applications.create({
                data: {
                    eventId: id,
                    userId: req.user.id,
                    professionalId: creativeProfile.id,
                    message,
                    proposedRate,
                    availability,
                    portfolio: portfolio || [],
                    status: 'PENDING'
                },
                include: {
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
                    events: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            });
            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                application,
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.EventController = EventController;
//# sourceMappingURL=eventController.js.map