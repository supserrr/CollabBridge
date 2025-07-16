import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';
import { EventStatus } from '@prisma/client';

export class EventController {
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        title,
        description,
        eventType,
        startDate,
        endDate,
        location,
        address,
        budget,
        currency = 'USD',
        requiredRoles,
        tags = [],
        maxApplicants,
        isPublic = true,
        requirements,
        deadlineDate,
      } = req.body;

      // Get event planner profile
      const eventPlanner = await prisma.eventPlanner.findUnique({
        where: { userId },
      });

      if (!eventPlanner) {
        throw createError('Event planner profile not found', 404);
      }

      const event = await prisma.event.create({
        data: {
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
          status: EventStatus.DRAFT,
        },
        include: {
          eventPlanner: {
            include: {
              user: {
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
    } catch (error) {
      throw error;
    }
  }

  async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 12,
        eventType,
        location,
        budgetMin,
        budgetMax,
        dateFrom,
        dateTo,
        requiredRoles,
        search,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {
        status: EventStatus.PUBLISHED,
        isPublic: true,
        startDate: { gte: new Date() },
      };

      if (eventType) where.eventType = eventType;
      if (location) where.location = { contains: location as string, mode: 'insensitive' };
      if (budgetMin || budgetMax) {
        where.budget = {};
        if (budgetMin) where.budget.gte = Number(budgetMin);
        if (budgetMax) where.budget.lte = Number(budgetMax);
      }
      if (dateFrom) where.startDate.gte = new Date(dateFrom as string);
      if (dateTo) where.startDate.lte = new Date(dateTo as string);
      if (requiredRoles) {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        where.requiredRoles = { hasSome: roles };
      }
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: [
            { isFeatured: 'desc' },
            { startDate: 'asc' },
          ],
          include: {
            eventPlanner: {
              include: {
                user: {
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
                applications: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
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
    } catch (error) {
      throw error;
    }
  }

  async getEventById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          eventPlanner: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  location: true,
                },
              },
            },
          },
          applications: {
            include: {
              professional: {
                include: {
                  user: {
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
              applications: true,
              bookings: true,
            },
          },
        },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      // Check if user can view this event
      const canView = event.isPublic || 
                     event.eventPlanner.userId === req.user!.id ||
                     req.user!.role === 'ADMIN';

      if (!canView) {
        throw createError('Not authorized to view this event', 403);
      }

      res.json({
        success: true,
        event,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Verify ownership
      const event = await prisma.event.findUnique({
        where: { id },
        include: { eventPlanner: true },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.eventPlanner.userId !== userId) {
        throw createError('Not authorized to update this event', 403);
      }

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: req.body,
        include: {
          eventPlanner: {
            include: {
              user: {
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
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Verify ownership
      const event = await prisma.event.findUnique({
        where: { id },
        include: { eventPlanner: true },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.eventPlanner.userId !== userId) {
        throw createError('Not authorized to delete this event', 403);
      }

      await prisma.event.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  async getMyEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 12, status } = req.query;

      const eventPlanner = await prisma.eventPlanner.findUnique({
        where: { userId },
      });

      if (!eventPlanner) {
        throw createError('Event planner profile not found', 404);
      }

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { eventPlannerId: eventPlanner.id };

      if (status) where.status = status;

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                applications: true,
                bookings: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
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
    } catch (error) {
      throw error;
    }
  }

  async applyToEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { message, proposedRate, availability, portfolio } = req.body;

      // Get creative profile
      const creativeProfile = await prisma.creativeProfile.findUnique({
        where: { userId },
      });

      if (!creativeProfile) {
        throw createError('Creative professional profile not found', 404);
      }

      // Verify event exists and is open for applications
      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.status !== EventStatus.PUBLISHED) {
        throw createError('Event is not open for applications', 400);
      }

      // Check if already applied
      const existingApplication = await prisma.eventApplication.findUnique({
        where: {
          eventId_professionalId: {
            eventId: id,
            professionalId: creativeProfile.id,
          },
        },
      });

      if (existingApplication) {
        throw createError('Already applied to this event', 409);
      }

      const application = await prisma.eventApplication.create({
        data: {
          eventId: id,
          professionalId: creativeProfile.id,
          message,
          proposedRate,
          availability,
          portfolio: portfolio || [],
        },
        include: {
          professional: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          event: {
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
    } catch (error) {
      throw error;
    }
  }
}
