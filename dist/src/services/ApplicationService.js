"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationService = exports.ApplicationService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const NotificationService_1 = require("./NotificationService");
const client_1 = require("@prisma/client");
class ApplicationService {
    async createApplication(data) {
        try {
            // Validate that event exists and is published
            const event = await database_1.prisma.events.findUnique({
                where: { id: data.eventId },
                include: { event_planners: true }
            });
            if (!event) {
                throw (0, errorHandler_1.createError)('Event not found', 404);
            }
            if (event.status !== 'PUBLISHED') {
                throw (0, errorHandler_1.createError)('Cannot apply to unpublished event', 400);
            }
            // Check if application deadline has passed
            if (event.deadlineDate && new Date() > event.deadlineDate) {
                throw (0, errorHandler_1.createError)('Application deadline has passed', 400);
            }
            // Validate that professional exists
            const professional = await database_1.prisma.creative_profiles.findUnique({
                where: { id: data.professionalId },
                include: { users: true }
            });
            if (!professional) {
                throw (0, errorHandler_1.createError)('Professional profile not found', 404);
            }
            // Check if user owns the professional profile
            if (professional.userId !== data.userId) {
                throw (0, errorHandler_1.createError)('users does not own this professional profile', 403);
            }
            // Check if application already exists
            const existingApplication = await database_1.prisma.event_applications.findUnique({
                where: {
                    eventId_professionalId: {
                        eventId: data.eventId,
                        professionalId: data.professionalId
                    }
                }
            });
            if (existingApplication) {
                throw (0, errorHandler_1.createError)('Application already exists for this event', 400);
            }
            // Check if event has reached maximum applicants
            if (event.maxApplicants) {
                const currentApplicationCount = await database_1.prisma.event_applications.count({
                    where: { eventId: data.eventId }
                });
                if (currentApplicationCount >= event.maxApplicants) {
                    throw (0, errorHandler_1.createError)('Event has reached maximum number of applicants', 400);
                }
            }
            // Create the application
            const application = await database_1.prisma.event_applications.create({
                data: {
                    eventId: data.eventId,
                    userId: data.userId,
                    professionalId: data.professionalId,
                    message: data.message,
                    proposedRate: data.proposedRate,
                    availability: data.availability || {},
                    portfolio: data.portfolio || [],
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
                }
            });
            // Send notification to event creator
            await NotificationService_1.notificationService.sendNotification({
                userId: event.creatorId,
                type: client_1.NotificationType.APPLICATION_UPDATE,
                title: 'New Event Application',
                message: `${professional.users.name} applied for your event "${event.title}"`,
                metadata: { applicationId: application.id, eventId: data.eventId },
                priority: 'normal',
                sendEmail: true
            });
            logger_1.logger.info(`Application created: ${application.id} for event ${data.eventId}`);
            return application;
        }
        catch (error) {
            logger_1.logger.error('Create application error:', error);
            throw error;
        }
    }
    async updateApplication(applicationId, data, updatedBy) {
        try {
            // Get existing application with all related data
            const existingApplication = await database_1.prisma.event_applications.findUnique({
                where: { id: applicationId },
                include: {
                    events: { include: { event_planners: true } },
                    users: true,
                    creative_profiles: { include: { users: true } }
                }
            });
            if (!existingApplication) {
                throw (0, errorHandler_1.createError)('Application not found', 404);
            }
            // Check permissions
            const isEventCreator = existingApplication.events.creatorId === updatedBy;
            const isApplicant = existingApplication.userId === updatedBy;
            if (!isEventCreator && !isApplicant) {
                throw (0, errorHandler_1.createError)('Not authorized to update this application', 403);
            }
            // Validate status transitions
            if (data.status && !this.isValidStatusTransition(existingApplication.status, data.status)) {
                throw (0, errorHandler_1.createError)(`Invalid status transition from ${existingApplication.status} to ${data.status}`, 400);
            }
            // Only event creator can change status
            if (data.status && !isEventCreator) {
                throw (0, errorHandler_1.createError)('Only event creator can change application status', 403);
            }
            // Prepare update data
            const updateData = {};
            if (data.status) {
                updateData.status = data.status;
                if (data.status !== 'PENDING') {
                    updateData.respondedAt = new Date();
                    updateData.response = data.response;
                }
            }
            if (isApplicant) {
                // Applicant can only update certain fields if application is still pending
                if (existingApplication.status === 'PENDING') {
                    if (data.proposedRate !== undefined)
                        updateData.proposedRate = data.proposedRate;
                    if (data.availability !== undefined)
                        updateData.availability = data.availability;
                    if (data.portfolio !== undefined)
                        updateData.portfolio = data.portfolio;
                }
            }
            // Update the application
            const updatedApplication = await database_1.prisma.event_applications.update({
                where: { id: applicationId },
                data: updateData,
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
                }
            });
            // Send notifications based on status change
            if (data.status && isEventCreator) {
                await this.sendStatusChangeNotification(updatedApplication, data.status);
            }
            logger_1.logger.info(`Application updated: ${applicationId} by user ${updatedBy}`);
            return updatedApplication;
        }
        catch (error) {
            logger_1.logger.error('Update application error:', error);
            throw error;
        }
    }
    async getApplicationsByEvent(eventId, page = 1, limit = 20, status) {
        try {
            const skip = (page - 1) * limit;
            const where = { eventId };
            if (status) {
                where.status = status;
            }
            const [applications, total] = await Promise.all([
                database_1.prisma.event_applications.findMany({
                    where,
                    include: {
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
                    take: limit
                }),
                database_1.prisma.event_applications.count({ where })
            ]);
            return {
                applications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Get applications by event error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch applications', 500);
        }
    }
    async getApplicationsByusers(userId, page = 1, limit = 20, status) {
        try {
            const skip = (page - 1) * limit;
            const where = { userId };
            if (status) {
                where.status = status;
            }
            const [applications, total] = await Promise.all([
                database_1.prisma.event_applications.findMany({
                    where,
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
                    take: limit
                }),
                database_1.prisma.event_applications.count({ where })
            ]);
            return {
                applications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Get applications by user error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch applications', 500);
        }
    }
    async getApplicationById(applicationId) {
        try {
            const application = await database_1.prisma.event_applications.findUnique({
                where: { id: applicationId },
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
                }
            });
            if (!application) {
                throw (0, errorHandler_1.createError)('Application not found', 404);
            }
            return application;
        }
        catch (error) {
            logger_1.logger.error('Get application by ID error:', error);
            throw error;
        }
    }
    async withdrawApplication(applicationId, userId) {
        try {
            const application = await database_1.prisma.event_applications.findUnique({
                where: { id: applicationId },
                include: {
                    events: { include: { event_planners: true } },
                    creative_profiles: { include: { users: true } }
                }
            });
            if (!application) {
                throw (0, errorHandler_1.createError)('Application not found', 404);
            }
            if (application.userId !== userId) {
                throw (0, errorHandler_1.createError)('Not authorized to withdraw this application', 403);
            }
            if (application.status !== 'PENDING') {
                throw (0, errorHandler_1.createError)('Can only withdraw pending applications', 400);
            }
            // Delete the application
            await database_1.prisma.event_applications.delete({
                where: { id: applicationId }
            });
            // Notify event creator
            await NotificationService_1.notificationService.sendNotification({
                userId: application.events.creatorId,
                type: client_1.NotificationType.APPLICATION_UPDATE,
                title: 'Application Withdrawn',
                message: `${application.creative_profiles.users.name} withdrew their application for "${application.events.title}"`,
                metadata: { eventId: application.eventId },
                priority: 'normal',
                sendEmail: false
            });
            logger_1.logger.info(`Application withdrawn: ${applicationId} by user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Withdraw application error:', error);
            throw error;
        }
    }
    async getApplicationStatistics(eventId, userId) {
        try {
            const where = {};
            if (eventId)
                where.eventId = eventId;
            if (userId)
                where.userId = userId;
            const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications] = await Promise.all([
                database_1.prisma.event_applications.count({ where }),
                database_1.prisma.event_applications.count({ where: { ...where, status: 'PENDING' } }),
                database_1.prisma.event_applications.count({ where: { ...where, status: 'ACCEPTED' } }),
                database_1.prisma.event_applications.count({ where: { ...where, status: 'REJECTED' } })
            ]);
            return {
                total: totalApplications,
                pending: pendingApplications,
                accepted: acceptedApplications,
                rejected: rejectedApplications,
                acceptanceRate: totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0
            };
        }
        catch (error) {
            logger_1.logger.error('Get application statistics error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch application statistics', 500);
        }
    }
    // Private helper methods
    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            PENDING: ['ACCEPTED', 'REJECTED'],
            ACCEPTED: ['REJECTED'], // Can reject an accepted application
            REJECTED: ['ACCEPTED'] // Can accept a rejected application
        };
        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }
    async sendStatusChangeNotification(application, newStatus) {
        try {
            let title;
            let message;
            switch (newStatus) {
                case 'ACCEPTED':
                    title = 'Application Accepted';
                    message = `Your application for "${application.events.title}" has been accepted!`;
                    break;
                case 'REJECTED':
                    title = 'Application Status Update';
                    message = `Your application for "${application.events.title}" has been updated`;
                    break;
                default:
                    return;
            }
            await NotificationService_1.notificationService.sendNotification({
                userId: application.userId,
                type: client_1.NotificationType.APPLICATION_UPDATE,
                title,
                message,
                metadata: {
                    applicationId: application.id,
                    eventId: application.eventId,
                    status: newStatus
                },
                priority: 'normal',
                sendEmail: true
            });
        }
        catch (error) {
            logger_1.logger.error('Send status change notification error:', error);
        }
    }
}
exports.ApplicationService = ApplicationService;
exports.applicationService = new ApplicationService();
//# sourceMappingURL=ApplicationService.js.map