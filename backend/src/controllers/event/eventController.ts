import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';
import { paginate, buildPaginationResponse } from '../../utils/helpers';

export class EventController {
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      budget,
      requiredRoles,
    } = req.body;

    // Verify user is an event planner
    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw createError('Only event planners can create events', 403);
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
        budget,
        requiredRoles: requiredRoles || [],
      },
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  }

  async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 10, eventType, location } = req.query;
    const { skip, take } = paginate(Number(page), Number(limit));

    const where: any = {
      status: 'PUBLISHED',
      isPublic: true,
    };

    if (eventType) where.eventType = eventType;
    if (location) where.location = { contains: location as string };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take,
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.count({ where }),
    ]);

    const response = buildPaginationResponse(events, Number(page), Number(limit), total);
    res.json(response);
  }

  async getEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      },
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    res.json(event);
  }

  async getMyEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;
    const { skip, take } = paginate(Number(page), Number(limit));

    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw createError('Event planner profile not found', 404);
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { eventPlannerId: eventPlanner.id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.count({
        where: { eventPlannerId: eventPlanner.id },
      }),
    ]);

    const response = buildPaginationResponse(events, Number(page), Number(limit), total);
    res.json(response);
  }

  async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;

    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw createError('Event planner profile not found', 404);
    }

    const event = await prisma.event.findFirst({
      where: {
        id,
        eventPlannerId: eventPlanner.id,
      },
    });

    if (!event) {
      throw createError('Event not found or not owned by you', 404);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  }

  async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;

    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw createError('Event planner profile not found', 404);
    }

    const event = await prisma.event.findFirst({
      where: {
        id,
        eventPlannerId: eventPlanner.id,
      },
    });

    if (!event) {
      throw createError('Event not found or not owned by you', 404);
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({ message: 'Event deleted successfully' });
  }

  async applyToEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    const { message, proposedRate } = req.body;

    const creativeProfile = await prisma.creativeProfile.findUnique({
      where: { userId },
    });

    if (!creativeProfile) {
      throw createError('Creative professional profile not found', 404);
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    // Check if already applied
    const existingApplication = await prisma.eventApplication.findFirst({
      where: {
        eventId: id,
        professionalId: creativeProfile.id,
      },
    });

    if (existingApplication) {
      throw createError('You have already applied to this event', 409);
    }

    const application = await prisma.eventApplication.create({
      data: {
        eventId: id,
        professionalId: creativeProfile.id,
        message,
        proposedRate,
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  }
}
