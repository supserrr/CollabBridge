import { Request, Response } from 'express';
import { events, EventStatus, BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/express';
import { HttpError } from '../utils/errors';

export class EventController {
  // Helper method to verify event access
  private async verifyEventAccess(eventId: string, userId: string): Promise<void> {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: { event_planners: true }
    });

    if (!event) {
      throw new HttpError('Event not found', 404);
    }

    if (event.event_planners.userId !== userId) {
      throw new HttpError('Unauthorized access to event', 403);
    }
  }

  // Route handler for creating a new event
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError('users not authenticated', 401);
      }

      const event = await this.createEventWithData(userId, req.body);
      res.status(201).json(event);
    } catch (error) {
      throw error;
    }
  }

  // Event creation helper
  private async createEventWithData(userId: string, data: Prisma.eventsCreateInput): Promise<events> {
    const eventPlanner = await prisma.event_planners.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw new HttpError('Event planner profile not found', 404);
    }

    return prisma.events.create({
      data: {
        ...data,
        event_planners: {
          connect: { id: eventPlanner.id }
        },
        status: EventStatus.DRAFT,
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
  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError('users not authenticated', 401);
    }

    await this.verifyEventAccess(id, userId);

    const event = await prisma.events.update({
      where: { id },
      data: req.body as Prisma.eventsUpdateInput,
      include: {
        event_planners: true,
        bookings: true
      }
    });

    res.json(event);
  }

  // Delete event
  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError('users not authenticated', 401);
    }

    await this.verifyEventAccess(id, userId);
    await prisma.events.delete({ where: { id } });
    res.status(204).end();
  }

  // Get event by ID
  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError('users not authenticated', 401);
    }

    const event = await prisma.events.findUnique({
      where: { id },
      include: {
        event_planners: true,
        bookings: true
      }
    });

    if (!event) {
      throw new HttpError('Event not found', 404);
    }

    res.json(event);
  }

  // Apply for event
  async apply(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError('users not authenticated', 401);
    }

    const professional = await prisma.creative_profiles.findUnique({
      where: { userId }
    });

    if (!professional) {
      throw new HttpError('Creative professional profile not found', 404);
    }

    const event = await prisma.events.findUnique({
      where: { id },
      include: { event_planners: true }
    });

    if (!event) {
      throw new HttpError('Event not found', 404);
    }

    const booking = await prisma.bookings.create({
      data: {
        events: { connect: { id } },
        users: { connect: { id: userId } },
        creative_profiles: { connect: { id: professional.id } },
        event_planners: { connect: { id: event.event_planners.id } },
        status: BookingStatus.PENDING,
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
