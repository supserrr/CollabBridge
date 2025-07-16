import { Request, Response } from 'express';
import { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AuthRequest } from '../../types/express';
import { HttpError } from '../../utils/errors';

export class BookingController {
  async createBooking(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpError('User not authenticated', 401);
    }

    const { eventId } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { eventPlanner: true }
    });

    if (!event) {
      throw new HttpError('Event not found', 404);
    }

    const professional = await prisma.creativeProfile.findUnique({
      where: { userId }
    });

    if (!professional) {
      throw new HttpError('Creative professional profile not found', 404);
    }

    const booking = await prisma.booking.create({
      data: {
        event: { connect: { id: eventId } },
        eventPlanner: { connect: { id: event.eventPlanner.id } },
        professional: { connect: { id: professional.id } },
        user: { connect: { id: userId } },
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        rate: req.body.rate,
        description: req.body.description,
        requirements: req.body.requirements,
        status: BookingStatus.PENDING,
      }
    });

    res.status(201).json(booking);
  }

  async getBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 12, status } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      let where: any = {};

      if (req.user!.role === 'EVENT_PLANNER') {
        const eventPlanner = await prisma.eventPlanner.findUnique({
          where: { userId },
        });
        if (eventPlanner) {
          where.eventPlannerId = eventPlanner.id;
        }
      } else if (req.user!.role === 'CREATIVE_PROFESSIONAL') {
        const creativeProfile = await prisma.creativeProfile.findUnique({
          where: { userId },
        });
        if (creativeProfile) {
          where.professionalId = creativeProfile.id;
        }
      }

      if (status) where.status = status;

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                eventType: true,
                location: true,
              },
            },
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
        }),
        prisma.booking.count({ where }),
      ]);

      res.json({
        success: true,
        bookings,
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

  async updateBookingStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          event: true,
          professional: {
            include: { user: true },
          },
          eventPlanner: {
            include: { user: true },
          },
        },
      });

      if (!booking) {
        throw new HttpError('Booking not found', 404);
      }

      // Check authorization
      const isPlanner = booking.eventPlanner.user.id === req.user!.id;
      const isCreative = booking.professional.user.id === req.user!.id;

      if (!isPlanner && !isCreative) {
        throw new HttpError('Not authorized to update this booking', 403);
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { 
          status, 
          notes,
          confirmedAt: status === BookingStatus.CONFIRMED ? new Date() : booking.confirmedAt,
          completedAt: status === BookingStatus.COMPLETED ? new Date() : booking.completedAt,
          cancelledAt: status === BookingStatus.CANCELLED ? new Date() : booking.cancelledAt,
        },
      });

      res.json({ 
        success: true,
        message: 'Booking status updated successfully', 
        booking: updatedBooking 
      });
    } catch (error) {
      throw error;
    }
  }

  async updateBooking(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new HttpError('User not authenticated', 401);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventPlanner: true,
        professional: true
      }
    });

    if (!booking) {
      throw new HttpError('Booking not found', 404);
    }

    // Check if user is authorized to update this booking
    if (booking.eventPlanner.userId !== userId && booking.professional.userId !== userId) {
      throw new HttpError('Not authorized to update this booking', 403);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: req.body,
      include: {
        event: true,
        eventPlanner: true,
        professional: true
      }
    });

    res.json(updatedBooking);
  }

  async getBooking(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new HttpError('User not authenticated', 401);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        event: true,
        eventPlanner: true,
        professional: true
      }
    });

    if (!booking) {
      throw new HttpError('Booking not found', 404);
    }

    // Check if user is authorized to view this booking
    if (booking.eventPlanner.userId !== userId && booking.professional.userId !== userId) {
      throw new HttpError('Not authorized to view this booking', 403);
    }

    res.json(booking);
  }
}
