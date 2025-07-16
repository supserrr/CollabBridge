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
            location: true,
          }
        },
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
              }
            }
          }
        },
        eventPlanner: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        }
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  }

  async getMyBookings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let where: any = {};

    if (userRole === 'EVENT_PLANNER') {
      const eventPlanner = await prisma.eventPlanner.findUnique({
        where: { userId },
      });
      if (!eventPlanner) {
        throw createError('Event planner profile not found', 404);
      }
      where.eventPlannerId = eventPlanner.id;
    } else if (userRole === 'CREATIVE_PROFESSIONAL') {
      const professional = await prisma.creativeProfile.findUnique({
        where: { userId },
      });
      if (!professional) {
        throw createError('Creative profile not found', 404);
      }
      where.professionalId = professional.id;
    }

    if (status) {
      where.status = status;
    }

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
              location: true,
              startDate: true,
              endDate: true,
            }
          },
          professional: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                }
              }
            }
          },
          eventPlanner: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                }
              }
            }
          }
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
  }

  async getBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

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
                avatar: true,
                email: true,
                phone: true,
              }
            }
          }
        },
        eventPlanner: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
                phone: true,
              }
            }
          }
        },
        payments: true,
      },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    // Verify access
    const hasAccess = 
      (userRole === 'EVENT_PLANNER' && booking.eventPlanner.userId === userId) ||
      (userRole === 'CREATIVE_PROFESSIONAL' && booking.professional.userId === userId);

    if (!hasAccess) {
      throw createError('Unauthorized to view this booking', 403);
    }

    res.json({
      success: true,
      booking,
    });
  }

  async updateBookingStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { status, reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventPlanner: true,
        professional: true,
      },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    // Verify access
    const hasAccess = 
      (userRole === 'EVENT_PLANNER' && booking.eventPlanner.userId === userId) ||
      (userRole === 'CREATIVE_PROFESSIONAL' && booking.professional.userId === userId);

    if (!hasAccess) {
      throw createError('Unauthorized to update this booking', 403);
    }

    // Validate status transitions
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw createError(`Cannot change status from ${booking.status} to ${status}`, 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(reason && { cancellationReason: reason }),
        ...(status === BookingStatus.CONFIRMED && { confirmedAt: new Date() }),
        ...(status === BookingStatus.COMPLETED && { completedAt: new Date() }),
        ...(status === BookingStatus.CANCELLED && { cancelledAt: new Date() }),
      },
      include: {
        event: true,
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        },
        eventPlanner: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        }
      },
    });

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: updatedBooking,
    });
  }

  async addPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;
    const { amount, paymentMethod, transactionId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventPlanner: true,
      },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    // Only event planner can add payments
    if (booking.eventPlanner.userId !== userId) {
      throw createError('Unauthorized to add payment to this booking', 403);
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId: id,
        amount,
        paymentMethod,
        transactionId,
        paidAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment added successfully',
      payment,
    });
  }
}
