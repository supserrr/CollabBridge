import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';
import { paginate, buildPaginationResponse } from '../../utils/helpers';

export class BookingController {
  async createBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const {
      eventId,
      professionalId,
      startDate,
      endDate,
      rate,
      rateType,
      description,
      requirements,
      terms,
    } = req.body;

    // Verify user is an event planner
    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw createError('Only event planners can create bookings', 403);
    }

    // Verify event belongs to this event planner
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        eventPlannerId: eventPlanner.id,
      },
    });

    if (!event) {
      throw createError('Event not found or not owned by you', 404);
    }

    // Verify professional exists
    const professional = await prisma.creativeProfile.findUnique({
      where: { id: professionalId },
      include: { user: true },
    });

    if (!professional) {
      throw createError('Professional not found', 404);
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        eventId,
        eventPlannerId: eventPlanner.id,
        professionalId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rate,
        rateType: rateType || 'hourly',
        description,
        requirements: requirements || [],
        terms,
        status: 'PENDING',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
          },
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  }

  async getBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;

    const { skip, take } = paginate(Number(page), Number(limit));

    // Determine if user is event planner or creative professional
    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    const creativeProfile = await prisma.creativeProfile.findUnique({
      where: { userId },
    });

    if (!eventPlanner && !creativeProfile) {
      throw createError('User profile not found', 404);
    }

    const where: any = {};
    
    if (eventPlanner) {
      where.eventPlannerId = eventPlanner.id;
    } else if (creativeProfile) {
      where.professionalId = creativeProfile.id;
    }

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.booking.count({ where }),
    ]);

    const response = buildPaginationResponse(
      bookings,
      Number(page),
      Number(limit),
      total
    );

    res.json(response);
  }

  async getBookingById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        event: true,
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
                email: true,
                avatar: true,
              },
            },
          },
        },
        payments: true,
        reviews: true,
      },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    // Check authorization
    const isEventPlanner = booking.eventPlanner.userId === userId;
    const isProfessional = booking.professional.userId === userId;

    if (!isEventPlanner && !isProfessional) {
      throw createError('Not authorized to view this booking', 403);
    }

    res.json(booking);
  }

  async updateBookingStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventPlanner: {
          include: { user: true },
        },
        professional: {
          include: { user: true },
        },
      },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    // Check authorization
    const isEventPlanner = booking.eventPlanner.userId === userId;
    const isProfessional = booking.professional.userId === userId;

    if (!isEventPlanner && !isProfessional) {
      throw createError('Not authorized to update this booking', 403);
    }

    // Update booking
    const updateData: any = { status, notes };

    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = userId;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking,
    });
  }

  async cancelBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventPlanner: { include: { user: true } },
        professional: { include: { user: true } },
      },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    // Check authorization
    const isEventPlanner = booking.eventPlanner.userId === userId;
    const isProfessional = booking.professional.userId === userId;

    if (!isEventPlanner && !isProfessional) {
      throw createError('Not authorized to cancel this booking', 403);
    }

    if (booking.status === 'COMPLETED') {
      throw createError('Cannot cancel completed booking', 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason,
      },
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });
  }
}
