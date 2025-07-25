"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const errorHandler_1 = require("../../middleware/errorHandler");
const ApplicationService_1 = require("../../services/ApplicationService");
class ApplicationController {
    // Get applications for an event (event planner only)
    async getEventApplications(req, res) {
        try {
            const { eventId } = req.params;
            const { page = 1, limit = 20, status } = req.query;
            // Verify user is the event creator
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../../config/database')));
            const event = await prisma.events.findUnique({
                where: { id: eventId },
                include: { event_planners: true }
            });
            if (!event) {
                throw (0, errorHandler_1.createError)('Event not found', 404);
            }
            if (event.creatorId !== req.user.id) {
                throw (0, errorHandler_1.createError)('Not authorized to view applications for this event', 403);
            }
            const result = await ApplicationService_1.applicationService.getApplicationsByEvent(eventId, Number(page), Number(limit), status);
            res.json({
                success: true,
                ...result
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Get user's own applications (creative professional)
    async getMyApplications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20, status } = req.query;
            const result = await ApplicationService_1.applicationService.getApplicationsByusers(userId, Number(page), Number(limit), status);
            // Transform the data to match frontend interface
            const transformedApplications = result.applications.map((app) => ({
                id: app.id,
                eventTitle: app.events.title,
                organizer: 'Event Organizer', // TODO: Get actual organizer name from event creator
                date: new Date(app.events.startDate).toLocaleDateString(),
                status: app.status,
                budget: app.events.budget ? `$${app.events.budget}` : 'Budget not specified',
                message: app.message,
                proposedRate: app.proposedRate
            }));
            res.json({
                success: true,
                applications: transformedApplications,
                pagination: result.pagination
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Get applications pending review (for event planners - all their events)
    async getPendingApplications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            // Get all events created by this user
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../../config/database')));
            const userEvents = await prisma.events.findMany({
                where: { creatorId: userId },
                select: { id: true }
            });
            if (userEvents.length === 0) {
                res.json({
                    success: true,
                    applications: [],
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: 0,
                        pages: 0
                    }
                });
                return;
            }
            const eventIds = userEvents.map(event => event.id);
            // Get all pending applications for these events
            const skip = (Number(page) - 1) * Number(limit);
            const [applications, total] = await Promise.all([
                prisma.event_applications.findMany({
                    where: {
                        eventId: { in: eventIds },
                        status: 'PENDING'
                    },
                    include: {
                        events: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                eventType: true,
                                startDate: true,
                                endDate: true,
                                location: true,
                                budget: true,
                                requiredRoles: true,
                                status: true
                            }
                        },
                        users: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        },
                        creative_profiles: {
                            include: {
                                users: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true
                                    }
                                }
                            },
                            select: {
                                id: true,
                                categories: true,
                                hourlyRate: true,
                                dailyRate: true,
                                experience: true,
                                skills: true,
                                users: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.event_applications.count({
                    where: {
                        eventId: { in: eventIds },
                        status: 'PENDING'
                    }
                })
            ]);
            // Transform the data to match frontend interface
            const transformedApplications = applications.map(app => ({
                id: app.id,
                eventTitle: app.events.title,
                creativeName: app.creative_profiles.users.name,
                role: app.creative_profiles.categories[0] || 'Creative Professional',
                experience: app.creative_profiles.experience || 'Not specified',
                rate: app.proposedRate ? `$${app.proposedRate}/day` : 'Not specified',
                appliedDate: new Date(app.createdAt).toLocaleDateString(),
                event: app.events.id,
                skill: app.creative_profiles.skills[0] || 'Multiple Skills',
                rating: 4.5, // TODO: Calculate actual rating from reviews
                status: app.status,
                message: app.message,
                proposedRate: app.proposedRate
            }));
            res.json({
                success: true,
                applications: transformedApplications,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Get application by ID
    async getApplicationById(req, res) {
        try {
            const { applicationId } = req.params;
            const userId = req.user.id;
            const application = await ApplicationService_1.applicationService.getApplicationById(applicationId);
            // Check if user is authorized to view this application
            const isApplicant = application.userId === userId;
            // Need to get the full event details to check creatorId
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../../config/database')));
            const event = await prisma.events.findUnique({
                where: { id: application.eventId },
                select: { creatorId: true }
            });
            const isEventCreator = event?.creatorId === userId;
            if (!isApplicant && !isEventCreator) {
                throw (0, errorHandler_1.createError)('Not authorized to view this application', 403);
            }
            res.json({
                success: true,
                data: application
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Update application status (event creator only)
    async updateApplicationStatus(req, res) {
        try {
            const { applicationId } = req.params;
            const { status, response } = req.body;
            const userId = req.user.id;
            const updatedApplication = await ApplicationService_1.applicationService.updateApplication(applicationId, { status, response }, userId);
            res.json({
                success: true,
                message: 'Application status updated successfully',
                data: updatedApplication
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Withdraw application (applicant only)
    async withdrawApplication(req, res) {
        try {
            const { applicationId } = req.params;
            const userId = req.user.id;
            await ApplicationService_1.applicationService.withdrawApplication(applicationId, userId);
            res.json({
                success: true,
                message: 'Application withdrawn successfully'
            });
        }
        catch (error) {
            throw error;
        }
    }
    // Get application statistics
    async getApplicationStatistics(req, res) {
        try {
            const { eventId } = req.query;
            const userId = req.user.id;
            const stats = await ApplicationService_1.applicationService.getApplicationStatistics(eventId, userId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.ApplicationController = ApplicationController;
//# sourceMappingURL=applicationController.js.map