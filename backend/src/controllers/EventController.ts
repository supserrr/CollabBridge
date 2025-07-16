import { Request, Response } from 'express';
import { Event, EventStatus, BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { HttpError } from '../utils/errors';
import { AuthRequest } from '../types/express';

export class EventController {
  // Helper method to verify event access
  private async verifyEventAccess(eventId: string, userId: string): Promise<void> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { eventPlanner: true }
    });

    if (!event) {
      throw new HttpError('Event not found', 404);
    }

    if (event.eventPlanner.userId !== userId) {
      throw new HttpError('Unauthorized access to event', 403);
    }
  }

  // Route handler for creating a new event
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError('User not authenticated', 401);
      }

      const event = await this.createEventWithData(userId, req.body);
      res.status(201).json(event);
    } catch (error) {
      throw error;
    }
  }

  // Event creation helper
  private async createEventWithData(userId: string, data: Prisma.EventCreateInput): Promise<Event> {
    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw new HttpError('Event planner profile not found', 404);
    }

    return prisma.event.create({
      data: {
        ...data,
        eventPlanner: {
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
        eventPlanner: true,
        bookings: true
      },
    });
  }

  // Update event
  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError('User not authenticated', 401);
    }

    await this.verifyEventAccess(id, userId);

    const event = await prisma.event.update({
      where: { id },
      data: req.body as Prisma.EventUpdateInput,
      include: {
        eventPlanner: true,
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
      throw new HttpError('User not authenticated', 401);
    }

    await this.verifyEventAccess(id, userId);
    await prisma.event.delete({ where: { id } });
    res.status(204).end();
  }

  // Get event by ID
  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError('User not authenticated', 401);
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventPlanner: true,
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
      throw new HttpError('User not authenticated', 401);
    }

    const professional = await prisma.creativeProfile.findUnique({
      where: { userId }
    });

    if (!professional) {
      throw new HttpError('Creative professional profile not found', 404);
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: { eventPlanner: true }
    });

    if (!event) {
      throw new HttpError('Event not found', 404);
    }

    const booking = await prisma.booking.create({
      data: {
        event: { connect: { id } },
        user: { connect: { id: userId } },
        professional: { connect: { id: professional.id } },
        eventPlanner: { connect: { id: event.eventPlanner.id } },
        status: BookingStatus.PENDING,
        startDate: event.startDate,
        endDate: event.endDate,
        rate: req.body.rate || 0,
        notes: req.body.notes || '',
      },
      include: {
        event: true,
        professional: true
      }
    });

    res.status(201).json(booking);
  }
}
