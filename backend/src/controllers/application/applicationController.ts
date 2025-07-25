/**
 * Application Controller
 * 
 * Handles all HTTP requests related to event applications functionality.
 * Manages the relationship between creative professionals and event planners
 * through application submissions, reviews, and status updates.
 * 
 * Key Responsibilities:
 * - Event application retrieval and filtering
 * - Application status management (pending, accepted, rejected)
 * - Authorization checks for application access
 * - Application statistics and analytics
 * 
 * @controller
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';
import { applicationService } from '../../services/ApplicationService';
import { logger } from '../../utils/logger';

/**
 * ApplicationController class
 * Contains all endpoint handlers for application-related operations
 */
export class ApplicationController {
  
  /**
   * Get applications for a specific event
   * Accessible only by the event creator (event planner)
   * 
   * @param req - Express request with eventId parameter
   * @param res - Express response
   * @returns Promise<void>
   * 
   * @route GET /api/events/:eventId/applications
   * @access Private (Event Planner only)
   */
  async getEventApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 20, status } = req.query;

      // Verify user is the event creator for authorization
      const { prisma } = await import('../../config/database');
      const event = await prisma.events.findUnique({
        where: { id: eventId },
        include: { event_planners: true }
      });

      // Handle event not found
      if (!event) {
        throw createError('Event not found', 404);
      }

      // Ensure only event creator can access applications
      if (event.creatorId !== req.user!.id) {
        throw createError('Not authorized to view applications for this event', 403);
      }

      // Fetch applications using application service
      const result = await applicationService.getApplicationsByEvent(
        eventId,
        Number(page),
        Number(limit),
        status as any
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's own applications
   * Returns applications submitted by the authenticated creative professional
   * 
   * @param req - Express request with user context
   * @param res - Express response
   * @returns Promise<void>
   * 
   * @route GET /api/applications/my
   * @access Private (Creative Professional only)
   */
  async getMyApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, status } = req.query;

      const result = await applicationService.getApplicationsByusers(
        userId,
        Number(page),
        Number(limit),
        status as any
      );

      // Transform the data to match frontend interface
      const transformedApplications = result.applications.map((app: any) => ({
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
    } catch (error) {
      throw error;
    }
  }

  // Get applications pending review (for event planners - all their events)
  async getPendingApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query;

      // Get all events created by this user
      const { prisma } = await import('../../config/database');
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
    } catch (error) {
      throw error;
    }
  }

  // Get application by ID
  async getApplicationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const userId = req.user!.id;

      const application = await applicationService.getApplicationById(applicationId);

      // Check if user is authorized to view this application
      const isApplicant = application.userId === userId;
      
      // Need to get the full event details to check creatorId
      const { prisma } = await import('../../config/database');
      const event = await prisma.events.findUnique({
        where: { id: application.eventId },
        select: { creatorId: true }
      });

      const isEventCreator = event?.creatorId === userId;

      if (!isApplicant && !isEventCreator) {
        throw createError('Not authorized to view this application', 403);
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      throw error;
    }
  }

  // Update application status (event creator only)
  async updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const { status, response } = req.body;
      const userId = req.user!.id;

      const updatedApplication = await applicationService.updateApplication(
        applicationId,
        { status, response },
        userId
      );

      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: updatedApplication
      });
    } catch (error) {
      throw error;
    }
  }

  // Withdraw application (applicant only)
  async withdrawApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const userId = req.user!.id;

      await applicationService.withdrawApplication(applicationId, userId);

      res.json({
        success: true,
        message: 'Application withdrawn successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  // Get application statistics
  async getApplicationStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.query;
      const userId = req.user!.id;

      const stats = await applicationService.getApplicationStatistics(
        eventId as string,
        userId
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw error;
    }
  }
}
