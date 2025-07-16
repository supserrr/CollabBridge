import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';
import { BookingStatus } from '@prisma/client';

export class BookingController {
  async createBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const {
      professionalId,
      eventId,
      startDate,
      endDate,
      rate,
      description,
      requirements,
    } = req.body;

    // Get event planner profile
    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw createError('Event planner profile not found', 404);
    }

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { eventPlanner: true }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.eventPlanner.userId !== userId) {
      throw createError('Unauthorized to create booking for this event', 403);
    }

    // Verify professional exists
    const professional = await prisma.creativeProfile.findUnique({
      where: { id: professionalId },
      include: { user: true }
    });

    if (!professional) {
      throw createError('Professional not found', 404);
    }

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        professionalId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
        OR: [
          {
            startDate: { lte: new Date(startDate) },
            endDate: { gte: new Date(startDate) },
          },
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(endDate) },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw createError('Professional is not available during the requested time', 409);
    }

    const booking = await prisma.booking.create({
      data: {
        eventId,
        eventPlannerId: eventPlanner.id,
        professionalId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rate,
        description,
        requirements: requirements || [],
        status: BookingStatus.PENDING,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
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
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  }

  async getBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  async updateBookingStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        throw createError('Booking not found', 404);
      }

      // Check authorization
      const isPlanner = booking.eventPlanner.user.id === req.user!.id;
      const isCreative = booking.professional.user.id === req.user!.id;

      if (!isPlanner && !isCreative) {
        throw createError('Not authorized to update this booking', 403);
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

  async getBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

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
          payments: true,
          reviews: {
            include: {
              reviewer: {
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

      if (!booking) {
        throw createError('Booking not found', 404);
      }

      // Check authorization
      const isPlanner = booking.eventPlanner.user.id === req.user!.id;
      const isCreative = booking.professional.user.id === req.user!.id;

      if (!isPlanner && !isCreative) {
        throw createError('Not authorized to view this booking', 403);
      }

      res.json({
        success: true,
        booking,
      });
    } catch (error) {
      throw error;
    }
  }
}
