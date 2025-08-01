import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';
import { EventStatus } from '@prisma/client';

export class EventController {
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      console.log(`Creating event for user ${userId}`);
      
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
        images = [],
      } = req.body;

      console.log('Event data received:', {
        title,
        eventType,
        startDate,
        endDate,
        location,
        requiredRoles
      });

      // Get event planner profile
      let eventPlanner = await prisma.event_planners.findUnique({
        where: { userId },
      });

      // If no event planner profile exists, create one (for existing users)
      if (!eventPlanner) {
        // First check if the user has the correct role
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { role: true, name: true, email: true }
        });

        if (!user) {
          throw createError('User not found', 404);
        }

        console.log(`User role: ${user.role} for ${user.email}`);

        if (user.role !== 'EVENT_PLANNER') {
          throw createError('User is not an event planner. Please update your account type to create events.', 403);
        }

        // Create the event planner profile
        eventPlanner = await prisma.event_planners.create({
          data: { userId }
        });

        console.log(`Created event planner profile for user ${userId} (${user.email})`);
      }

      console.log('Creating event with data:', {
        isPublic,
        status: isPublic ? EventStatus.PUBLISHED : EventStatus.DRAFT,
        title,
        description: description.length,
        images: images?.length || 0
      });

      const event = await prisma.events.create({
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
          status: isPublic ? EventStatus.PUBLISHED : EventStatus.DRAFT, // Auto-publish if public
          images: images || [], // Use provided images or empty array
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
        prisma.events.findMany({
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
                    email: true,
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
        prisma.events.count({ where }),
      ]);

      // Calculate average ratings for each event planner
      const eventsWithRatings = await Promise.all(
        events.map(async (event) => {
          let avgRating = null;
          let totalReviews = 0;

          if (event.event_planners?.users?.id) {
            // Get average rating for this event planner
            const ratingData = await prisma.reviews.aggregate({
              where: {
                revieweeId: event.event_planners.users.id,
                isPublic: true,
              },
              _avg: {
                rating: true,
              },
              _count: {
                rating: true,
              },
            });

            avgRating = ratingData._avg.rating ? Math.round(ratingData._avg.rating * 10) / 10 : null;
            totalReviews = ratingData._count.rating || 0;
          }

          return {
            ...event,
            event_planners: {
              ...event.event_planners,
              avgRating,
              totalReviews,
            },
          };
        })
      );

      res.json({
        success: true,
        events: eventsWithRatings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getEventById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await prisma.events.findUnique({
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
        throw createError('Event not found', 404);
      }

      // Check if user can view this event
      const canView = event.isPublic || 
                     event.eventPlannerId === req.user!.id ||
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

      // Get the user's event planner profile
      const eventPlanner = await prisma.event_planners.findUnique({
        where: { userId },
      });

      if (!eventPlanner) {
        throw createError('Event planner profile not found', 404);
      }

      // Verify ownership
      const event = await prisma.events.findUnique({
        where: { id },
        include: { event_planners: true },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.eventPlannerId !== eventPlanner.id) {
        throw createError('Not authorized to update this event', 403);
      }

      const updatedEvent = await prisma.events.update({
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
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Get the user's event planner profile
      const eventPlanner = await prisma.event_planners.findUnique({
        where: { userId },
      });

      if (!eventPlanner) {
        throw createError('Event planner profile not found', 404);
      }

      // Verify ownership
      const event = await prisma.events.findUnique({
        where: { id },
        include: { event_planners: true },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.eventPlannerId !== eventPlanner.id) {
        throw createError('Not authorized to delete this event', 403);
      }

      await prisma.events.delete({
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

      let eventPlanner = await prisma.event_planners.findUnique({
        where: { userId },
      });

      if (!eventPlanner) {
        // Auto-create event planner profile if it doesn't exist
        eventPlanner = await prisma.event_planners.create({
          data: { userId }
        });
        console.log(`Auto-created event planner profile for user ${userId}`);
      }

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = { eventPlannerId: eventPlanner.id };

      if (status) where.status = status;

      const [events, total] = await Promise.all([
        prisma.events.findMany({
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
        prisma.events.count({ where }),
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
      const creativeProfile = await prisma.creative_profiles.findUnique({
        where: { userId },
      });

      if (!creativeProfile) {
        throw createError('Creative professional profile not found', 404);
      }

      // Verify event exists and is open for applications
      const event = await prisma.events.findUnique({
        where: { id },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.status !== EventStatus.PUBLISHED) {
        throw createError('Event is not open for applications', 400);
      }

      // Check if already applied
      const existingApplication = await prisma.event_applications.findUnique({
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

      const application = await prisma.event_applications.create({
        data: {
          eventId: id,
          userId: req.user!.id,
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
    } catch (error) {
      throw error;
    }
  }

  async publishEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Get event planner profile
      const eventPlanner = await prisma.event_planners.findUnique({
        where: { userId },
      });

      if (!eventPlanner) {
        throw createError('Event planner profile not found', 404);
      }

      // Find the event and verify ownership
      const event = await prisma.events.findFirst({
        where: {
          id,
          eventPlannerId: eventPlanner.id,
        },
      });

      if (!event) {
        throw createError('Event not found or you do not have permission to modify it', 404);
      }

      if (event.status === EventStatus.PUBLISHED) {
        throw createError('Event is already published', 400);
      }

      // Update event status to published
      const updatedEvent = await prisma.events.update({
        where: { id },
        data: {
          status: EventStatus.PUBLISHED,
          isPublic: true, // Ensure it's public when published
        },
        include: {
          event_planners: {
            include: {
              users: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
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

      res.json({
        success: true,
        message: 'Event published successfully',
        event: updatedEvent,
      });
    } catch (error) {
      throw error;
    }
  }
}
