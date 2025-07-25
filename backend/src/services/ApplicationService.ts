/**
 * Application Service
 * 
 * Core business logic service for managing event applications between creative professionals
 * and event planners. Handles the complete application lifecycle including creation,
 * status updates, filtering, and notifications.
 * 
 * Key Responsibilities:
 * - Application CRUD operations
 * - Status management (pending, accepted, rejected, withdrawn)
 * - Real-time notifications to relevant parties
 * - Application filtering and search functionality
 * - Business logic validation and data integrity
 * - Integration with notification and caching systems
 * 
 * @service
 */

import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { notificationService } from './NotificationService';
import { NotificationType, ApplicationStatus } from '@prisma/client';

/**
 * Interface for creating new applications
 * Contains all necessary data for application submission
 */
export interface CreateApplicationData {
  eventId: string;          // ID of the event being applied to
  userId: string;           // ID of the applicant (creative professional)
  professionalId: string;   // Professional profile ID
  message?: string;         // Optional application message
  proposedRate?: number;    // Proposed hourly/daily rate
  availability?: any;       // Availability information
  portfolio?: string[];     // Portfolio items/URLs
}

/**
 * Interface for updating existing applications
 * Used for status changes and additional information
 */
export interface UpdateApplicationData {
  status?: ApplicationStatus;  // New application status
  response?: string;          // Response message from event planner
  proposedRate?: number;      // Updated rate proposal
  availability?: any;         // Updated availability
  portfolio?: string[];       // Updated portfolio items
}

/**
 * Interface for filtering applications
 * Supports complex queries and search functionality
 */
export interface ApplicationFilters {
  eventId?: string;          // Filter by specific event
  userId?: string;           // Filter by specific user
  professionalId?: string;   // Filter by professional profile
  status?: ApplicationStatus; // Filter by application status
  startDate?: Date;          // Filter by date range start
  endDate?: Date;           // Filter by date range end
}

/**
 * Extended application interface with related data
 * Includes event and user information for complete context
 */
export interface ApplicationWithDetails {
  id: string;
  eventId: string;
  userId: string;
  professionalId: string;
  message: string | null;
  proposedRate: number | null;
  availability: any;
  portfolio: string[];
  status: ApplicationStatus;
  response: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  events: {
    id: string;
    title: string;
    description: string;
    eventType: string;
    startDate: Date;
    endDate: Date;
    location: string;
    budget: number | null;
    requiredRoles: string[];
    status: string;
  };
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  creative_profiles: {
    id: string;
    categories: string[];
    hourlyRate: number | null;
    dailyRate: number | null;
    experience: string | null;
    skills: string[];
    users: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  };
}

export class ApplicationService {
  async createApplication(data: CreateApplicationData): Promise<ApplicationWithDetails> {
    try {
      // Validate that event exists and is published
      const event = await prisma.events.findUnique({
        where: { id: data.eventId },
        include: { event_planners: true }
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.status !== 'PUBLISHED') {
        throw createError('Cannot apply to unpublished event', 400);
      }

      // Check if application deadline has passed
      if (event.deadlineDate && new Date() > event.deadlineDate) {
        throw createError('Application deadline has passed', 400);
      }

      // Validate that professional exists
      const professional = await prisma.creative_profiles.findUnique({
        where: { id: data.professionalId },
        include: { users: true }
      });

      if (!professional) {
        throw createError('Professional profile not found', 404);
      }

      // Check if user owns the professional profile
      if (professional.userId !== data.userId) {
        throw createError('users does not own this professional profile', 403);
      }

      // Check if application already exists
      const existingApplication = await prisma.event_applications.findUnique({
        where: {
          eventId_professionalId: {
            eventId: data.eventId,
            professionalId: data.professionalId
          }
        }
      });

      if (existingApplication) {
        throw createError('Application already exists for this event', 400);
      }

      // Check if event has reached maximum applicants
      if (event.maxApplicants) {
        const currentApplicationCount = await prisma.event_applications.count({
          where: { eventId: data.eventId }
        });

        if (currentApplicationCount >= event.maxApplicants) {
          throw createError('Event has reached maximum number of applicants', 400);
        }
      }

      // Create the application
      const application = await prisma.event_applications.create({
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
      await notificationService.sendNotification({
        userId: event.creatorId,
        type: NotificationType.APPLICATION_UPDATE,
        title: 'New Event Application',
        message: `${professional.users.name} applied for your event "${event.title}"`,
        metadata: { applicationId: application.id, eventId: data.eventId },
        priority: 'normal',
        sendEmail: true
      });

      logger.info(`Application created: ${application.id} for event ${data.eventId}`);
      return application as ApplicationWithDetails;
    } catch (error) {
      logger.error('Create application error:', error);
      throw error;
    }
  }

  async updateApplication(
    applicationId: string,
    data: UpdateApplicationData,
    updatedBy: string
  ): Promise<ApplicationWithDetails> {
    try {
      // Get existing application with all related data
      const existingApplication = await prisma.event_applications.findUnique({
        where: { id: applicationId },
        include: {
          events: { include: { event_planners: true } },
          users: true,
          creative_profiles: { include: { users: true } }
        }
      });

      if (!existingApplication) {
        throw createError('Application not found', 404);
      }

      // Check permissions
      const isEventCreator = existingApplication.events.creatorId === updatedBy;
      const isApplicant = existingApplication.userId === updatedBy;

      if (!isEventCreator && !isApplicant) {
        throw createError('Not authorized to update this application', 403);
      }

      // Validate status transitions
      if (data.status && !this.isValidStatusTransition(existingApplication.status, data.status)) {
        throw createError(`Invalid status transition from ${existingApplication.status} to ${data.status}`, 400);
      }

      // Only event creator can change status
      if (data.status && !isEventCreator) {
        throw createError('Only event creator can change application status', 403);
      }

      // Prepare update data
      const updateData: any = {};
      
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
          if (data.proposedRate !== undefined) updateData.proposedRate = data.proposedRate;
          if (data.availability !== undefined) updateData.availability = data.availability;
          if (data.portfolio !== undefined) updateData.portfolio = data.portfolio;
        }
      }

      // Update the application
      const updatedApplication = await prisma.event_applications.update({
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

      logger.info(`Application updated: ${applicationId} by user ${updatedBy}`);
      return updatedApplication as ApplicationWithDetails;
    } catch (error) {
      logger.error('Update application error:', error);
      throw error;
    }
  }

  async getApplicationsByEvent(
    eventId: string,
    page: number = 1,
    limit: number = 20,
    status?: ApplicationStatus
  ) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = { eventId };
      if (status) {
        where.status = status;
      }

      const [applications, total] = await Promise.all([
        prisma.event_applications.findMany({
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
        prisma.event_applications.count({ where })
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
    } catch (error) {
      logger.error('Get applications by event error:', error);
      throw createError('Failed to fetch applications', 500);
    }
  }

  async getApplicationsByusers(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: ApplicationStatus
  ) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const [applications, total] = await Promise.all([
        prisma.event_applications.findMany({
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
        prisma.event_applications.count({ where })
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
    } catch (error) {
      logger.error('Get applications by user error:', error);
      throw createError('Failed to fetch applications', 500);
    }
  }

  async getApplicationById(applicationId: string): Promise<ApplicationWithDetails> {
    try {
      const application = await prisma.event_applications.findUnique({
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
        throw createError('Application not found', 404);
      }

      return application as ApplicationWithDetails;
    } catch (error) {
      logger.error('Get application by ID error:', error);
      throw error;
    }
  }

  async withdrawApplication(applicationId: string, userId: string): Promise<void> {
    try {
      const application = await prisma.event_applications.findUnique({
        where: { id: applicationId },
        include: {
          events: { include: { event_planners: true } },
          creative_profiles: { include: { users: true } }
        }
      });

      if (!application) {
        throw createError('Application not found', 404);
      }

      if (application.userId !== userId) {
        throw createError('Not authorized to withdraw this application', 403);
      }

      if (application.status !== 'PENDING') {
        throw createError('Can only withdraw pending applications', 400);
      }

      // Delete the application
      await prisma.event_applications.delete({
        where: { id: applicationId }
      });

      // Notify event creator
      await notificationService.sendNotification({
        userId: application.events.creatorId,
        type: NotificationType.APPLICATION_UPDATE,
        title: 'Application Withdrawn',
        message: `${application.creative_profiles.users.name} withdrew their application for "${application.events.title}"`,
        metadata: { eventId: application.eventId },
        priority: 'normal',
        sendEmail: false
      });

      logger.info(`Application withdrawn: ${applicationId} by user ${userId}`);
    } catch (error) {
      logger.error('Withdraw application error:', error);
      throw error;
    }
  }

  async getApplicationStatistics(eventId?: string, userId?: string) {
    try {
      const where: any = {};
      if (eventId) where.eventId = eventId;
      if (userId) where.userId = userId;

      const [
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications
      ] = await Promise.all([
        prisma.event_applications.count({ where }),
        prisma.event_applications.count({ where: { ...where, status: 'PENDING' } }),
        prisma.event_applications.count({ where: { ...where, status: 'ACCEPTED' } }),
        prisma.event_applications.count({ where: { ...where, status: 'REJECTED' } })
      ]);

      return {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
        acceptanceRate: totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0
      };
    } catch (error) {
      logger.error('Get application statistics error:', error);
      throw createError('Failed to fetch application statistics', 500);
    }
  }

  // Private helper methods
  private isValidStatusTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): boolean {
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      PENDING: ['ACCEPTED', 'REJECTED'],
      ACCEPTED: ['REJECTED'], // Can reject an accepted application
      REJECTED: ['ACCEPTED'] // Can accept a rejected application
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async sendStatusChangeNotification(application: any, newStatus: ApplicationStatus): Promise<void> {
    try {
      let title: string;
      let message: string;

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

      await notificationService.sendNotification({
        userId: application.userId,
        type: NotificationType.APPLICATION_UPDATE,
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
    } catch (error) {
      logger.error('Send status change notification error:', error);
    }
  }
}

export const applicationService = new ApplicationService();
