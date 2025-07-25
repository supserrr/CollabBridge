"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
class EventController {
    // Helper method to verify event access
    async verifyEventAccess(eventId, userId) {
        const event = await database_1.prisma.events.findUnique({
            where: { id: eventId },
            include: { event_planners: true }
        });
        if (!event) {
            throw new errors_1.HttpError('Event not found', 404);
        }
        if (event.event_planners.userId !== userId) {
            throw new errors_1.HttpError('Unauthorized access to event', 403);
        }
    }
    // Route handler for creating a new event
    async create(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errors_1.HttpError('users not authenticated', 401);
            }
            const event = await this.createEventWithData(userId, req.body);
            res.status(201).json(event);
        }
        catch (error) {
            throw error;
        }
    }
    // Event creation helper
    async createEventWithData(userId, data) {
        const eventPlanner = await database_1.prisma.event_planners.findUnique({
            where: { userId },
        });
        if (!eventPlanner) {
            throw new errors_1.HttpError('Event planner profile not found', 404);
        }
        return database_1.prisma.events.create({
            data: {
                ...data,
                event_planners: {
                    connect: { id: eventPlanner.id }
                },
                status: client_1.EventStatus.DRAFT,
                currency: data.currency || 'USD',
                requiredRoles: data.requiredRoles || [],
                tags: data.tags || [],
                images: [],
                startDate: new Date(data.startDate || Date.now()),
                endDate: new Date(data.endDate || Date.now()),
            },
            include: {
                event_planners: true,
                bookings: true
            },
        });
    }
    // Update event
    async update(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.HttpError('users not authenticated', 401);
        }
        await this.verifyEventAccess(id, userId);
        const event = await database_1.prisma.events.update({
            where: { id },
            data: req.body,
            include: {
                event_planners: true,
                bookings: true
            }
        });
        res.json(event);
    }
    // Delete event
    async delete(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.HttpError('users not authenticated', 401);
        }
        await this.verifyEventAccess(id, userId);
        await database_1.prisma.events.delete({ where: { id } });
        res.status(204).end();
    }
    // Get event by ID
    async getById(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.HttpError('users not authenticated', 401);
        }
        const event = await database_1.prisma.events.findUnique({
            where: { id },
            include: {
                event_planners: true,
                bookings: true
            }
        });
        if (!event) {
            throw new errors_1.HttpError('Event not found', 404);
        }
        res.json(event);
    }
    // Apply for event
    async apply(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.HttpError('users not authenticated', 401);
        }
        const professional = await database_1.prisma.creative_profiles.findUnique({
            where: { userId }
        });
        if (!professional) {
            throw new errors_1.HttpError('Creative professional profile not found', 404);
        }
        const event = await database_1.prisma.events.findUnique({
            where: { id },
            include: { event_planners: true }
        });
        if (!event) {
            throw new errors_1.HttpError('Event not found', 404);
        }
        const booking = await database_1.prisma.bookings.create({
            data: {
                events: { connect: { id } },
                users: { connect: { id: userId } },
                creative_profiles: { connect: { id: professional.id } },
                event_planners: { connect: { id: event.event_planners.id } },
                status: client_1.BookingStatus.PENDING,
                startDate: event.startDate,
                endDate: event.endDate,
                rate: req.body.rate || 0,
                notes: req.body.notes || '',
            },
            include: {
                events: true,
                creative_profiles: true
            }
        });
        res.status(201).json(booking);
    }
}
exports.EventController = EventController;
//# sourceMappingURL=EventController.js.map