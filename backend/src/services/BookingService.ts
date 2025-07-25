import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { NotificationService } from './NotificationService';
import { EmailService } from './EmailService';

export interface CreateBookingData {
  eventId: string;
  professionalId: string;
  startDate: Date;
  endDate: Date;
  rate: number;
  currency?: string;
  description?: string;
  requirements?: string[];
  notes?: string;
}

export interface UpdateBookingStatusData {
  status: string;
  notes?: string;
  cancellationReason?: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class BookingService {
  private notificationService: NotificationService;
  private emailService: EmailService;

  constructor() {
    this.notificationService = new NotificationService();
    this.emailService = new EmailService();
  }

  async createBooking(
    eventId: string, 
    professionalId: string, 
    plannerusersId: string, 
    bookingData: CreateBookingData
  ) {
    try {
      // Validate event exists and is accessible
      const event = await prisma.events.findUnique({
        where: { id: eventId },
        include: { 
          event_planners: { include: { users: true } },
          _count: { select: { bookings: true } }
        }
      });

      if (!event || event.event_planners.userId !== plannerusersId) {
        throw createError('Event not found or access denied', 403);
      }

      // Validate professional exists and is active
      const professional = await prisma.creative_profiles.findUnique({
        where: { id: professionalId },
        include: { users: true }
      });

      if (!professional || !professional.users.isActive) {
        throw createError('Professional not found or inactive', 404);
      }

      // Check for existing active booking
      const existingBooking = await prisma.bookings.findFirst({
        where: {
          eventId,
          professionalId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] }
        }
      });

      if (existingBooking) {
        throw createError('Active booking already exists for this professional', 409);
      }

      // Validate date overlap
      const hasDateConflict = await this.checkDateConflict(
        professionalId, 
        bookingData.startDate, 
        bookingData.endDate
      );

      if (hasDateConflict) {
        throw createError('Professional has conflicting bookings for these dates', 409);
      }

      // Create booking with transaction
      return await prisma.$transaction(async (tx) => {
        const booking = await tx.bookings.create({
          data: {
            eventId,
            professionalId,
            eventPlannerId: event.event_planners.id,
            userId: plannerusersId,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            rate: bookingData.rate,
            currency: bookingData.currency || 'USD',
            description: bookingData.description,
            requirements: bookingData.requirements || [],
            notes: bookingData.notes,
            status: BookingStatus.PENDING,
          },
          include: {
            events: true,
            creative_profiles: { include: { users: true } },
            event_planners: { include: { users: true } }
          }
        });

        // Send notification to professional
        await this.notificationService.sendNotification({
          userId: professional.userId,
          type: 'BOOKING_REQUEST' as any,
          title: 'New Booking Request',
          message: `You have a new booking request for ${event.title}`,
          metadata: { 
            bookingId: booking.id, 
            eventId,
            eventTitle: event.title,
            plannerName: event.event_planners.users.name
          },
          priority: 'high',
          sendEmail: true
        });

        // Send email notification
        await this.emailService.sendBookingNotification(
          professional.users.email,
          professional.users.name,
          event.title,
          `${process.env.FRONTEND_URL}/bookings/${booking.id}`
        );

        logger.info('Booking created successfully', {
          bookingId: booking.id,
          eventId,
          professionalId,
          plannerId: plannerusersId
        });

        return booking;
      });
    } catch (error) {
      logger.error('Create booking error:', error);
      throw error;
    }
  }

  async updateBookingStatus(
    bookingId: string, 
    userId: string, 
    statusData: UpdateBookingStatusData
  ) {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          event_planners: { include: { users: true } },
          creative_profiles: { include: { users: true } },
          events: true
        }
      });

      if (!booking) {
        throw createError('Booking not found', 404);
      }

      // Verify user authorization
      const isPlanner = booking.event_planners.userId === userId;
      const isProfessional = booking.creative_profiles.userId === userId;

      if (!isPlanner && !isProfessional) {
        throw createError('Not authorized to update this booking', 403);
      }

      // Business logic for status transitions
      const validTransitions = this.getValidStatusTransitions(
        booking.status as BookingStatus, 
        isPlanner, 
        isProfessional
      );
      
      if (!validTransitions.includes(statusData.status as BookingStatus)) {
        throw createError(
          `Cannot transition from ${booking.status} to ${statusData.status}`, 
          400
        );
      }

      return await prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.bookings.update({
          where: { id: bookingId },
          data: {
            status: statusData.status as any,
            notes: statusData.notes,
            cancellationReason: statusData.cancellationReason,
            confirmedAt: statusData.status === BookingStatus.CONFIRMED ? new Date() : booking.confirmedAt,
            completedAt: statusData.status === BookingStatus.COMPLETED ? new Date() : booking.completedAt,
            cancelledAt: statusData.status === BookingStatus.CANCELLED ? new Date() : booking.cancelledAt,
          },
          include: {
            events: true,
            creative_profiles: { include: { users: true } },
            event_planners: { include: { users: true } }
          }
        });

        // Send status update notification
        const recipientId = isPlanner ? booking.creative_profiles.userId : booking.event_planners.userId;
        const recipientName = isPlanner ? booking.creative_profiles.users.name : booking.event_planners.users.name;
        
        await this.notificationService.sendNotification({
          userId: recipientId,
          type: 'BOOKING_REQUEST' as any,
          title: 'Booking Status Updated',
          message: `Booking for ${booking.events.title} is now ${statusData.status.toLowerCase()}`,
          metadata: { 
            bookingId, 
            status: statusData.status,
            eventTitle: booking.events.title
          },
          priority: 'normal',
          sendEmail: true
        });

        // Send email notification for important status changes
        if ([BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED].includes(statusData.status as BookingStatus)) {
          const recipient = isPlanner ? booking.creative_profiles.users : booking.event_planners.users;
          await this.emailService.sendBookingNotification(
            recipient.email,
            recipient.name,
            booking.events.title,
            `${process.env.FRONTEND_URL}/bookings/${bookingId}`
          );
        }

        logger.info('Booking status updated', {
          bookingId,
          oldStatus: booking.status,
          newStatus: statusData.status,
          updatedBy: userId
        });

        return updatedBooking;
      });
    } catch (error) {
      logger.error('Update booking status error:', error);
      throw error;
    }
  }

  async getBookingsByusers(userId: string, userRole: string, filters: any = {}) {
    try {
      const { page = 1, limit = 12, status } = filters;
      const skip = (page - 1) * limit;

      let where: any = {};

      if (userRole === 'EVENT_PLANNER') {
        const eventPlanner = await prisma.event_planners.findUnique({
          where: { userId },
        });
        if (eventPlanner) {
          where.eventPlannerId = eventPlanner.id;
        } else {
          return { bookings: [], pagination: this.buildPagination(0, page, limit) };
        }
      } else if (userRole === 'CREATIVE_PROFESSIONAL') {
        const creativeProfile = await prisma.creative_profiles.findUnique({
          where: { userId },
        });
        if (creativeProfile) {
          where.professionalId = creativeProfile.id;
        } else {
          return { bookings: [], pagination: this.buildPagination(0, page, limit) };
        }
      }

      if (status) where.status = status;

      const [bookings, total] = await Promise.all([
        prisma.bookings.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            events: {
              select: {
                id: true,
                title: true,
                eventType: true,
                location: true,
                startDate: true,
                endDate: true,
              },
            },
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
        }),
        prisma.bookings.count({ where }),
      ]);

      return {
        bookings,
        pagination: this.buildPagination(total, page, limit),
      };
    } catch (error) {
      logger.error('Get bookings by user error:', error);
      throw createError('Failed to fetch bookings', 500);
    }
  }

  async getBookingById(bookingId: string, userId: string) {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: bookingId },
        include: {
          events: {
            include: {
              event_planners: { include: { users: true } }
            }
          },
          creative_profiles: { include: { users: true } },
          event_planners: { include: { users: true } },
          reviews: {
            include: {
              users_reviews_reviewerIdTousers: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        }
      });

      if (!booking) {
        throw createError('Booking not found', 404);
      }

      // Check authorization
      const isPlanner = booking.event_planners.userId === userId;
      const isProfessional = booking.creative_profiles.userId === userId;

      if (!isPlanner && !isProfessional) {
        throw createError('Not authorized to view this booking', 403);
      }

      return booking;
    } catch (error) {
      logger.error('Get booking by ID error:', error);
      throw error;
    }
  }

  private async checkDateConflict(
    professionalId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<boolean> {
    const conflictingBookings = await prisma.bookings.findMany({
      where: {
        professionalId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate }
          }
        ]
      }
    });

    return conflictingBookings.length > 0;
  }

  private getValidStatusTransitions(
    currentStatus: BookingStatus, 
    isPlanner: boolean, 
    isProfessional: boolean
  ): BookingStatus[] {
    const transitions: Record<BookingStatus, { planner: BookingStatus[], professional: BookingStatus[] }> = {
      [BookingStatus.PENDING]: {
        planner: [BookingStatus.CANCELLED],
        professional: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED]
      },
      [BookingStatus.CONFIRMED]: {
        planner: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
        professional: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED]
      },
      [BookingStatus.IN_PROGRESS]: {
        planner: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
        professional: [BookingStatus.COMPLETED]
      },
      [BookingStatus.COMPLETED]: {
        planner: [],
        professional: []
      },
      [BookingStatus.CANCELLED]: {
        planner: [],
        professional: []
      }
    };

    return isPlanner ? transitions[currentStatus].planner : transitions[currentStatus].professional;
  }

  private buildPagination(total: number, page: number, limit: number) {
    const pages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  }

  async getBookingStatistics(userId: string, userRole: string) {
    try {
      let where: any = {};

      if (userRole === 'EVENT_PLANNER') {
        const eventPlanner = await prisma.event_planners.findUnique({
          where: { userId },
        });
        if (eventPlanner) {
          where.eventPlannerId = eventPlanner.id;
        }
      } else if (userRole === 'CREATIVE_PROFESSIONAL') {
        const creativeProfile = await prisma.creative_profiles.findUnique({
          where: { userId },
        });
        if (creativeProfile) {
          where.professionalId = creativeProfile.id;
        }
      }

      const [
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue
      ] = await Promise.all([
        prisma.bookings.count({ where }),
        prisma.bookings.count({ where: { ...where, status: BookingStatus.PENDING } }),
        prisma.bookings.count({ where: { ...where, status: BookingStatus.CONFIRMED } }),
        prisma.bookings.count({ where: { ...where, status: BookingStatus.COMPLETED } }),
        prisma.bookings.count({ where: { ...where, status: BookingStatus.CANCELLED } }),
        prisma.bookings.aggregate({
          where: { ...where, status: BookingStatus.COMPLETED },
          _sum: { rate: true }
        })
      ]);

      return {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: totalRevenue._sum.rate || 0
      };
    } catch (error) {
      logger.error('Get booking statistics error:', error);
      throw createError('Failed to fetch booking statistics', 500);
    }
  }
}

export const bookingService = new BookingService();
