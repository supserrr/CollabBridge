#!/bin/bash

echo "🔧 Creating backend controller files..."

# Create Authentication Controller
cat > backend/src/controllers/auth/authController.ts << 'EOF'
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { verifyFirebaseToken } from '../../config/firebase';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';
import { logger } from '../../utils/logger';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { email, name, role, firebaseUid } = req.body;

    try {
      // Verify Firebase token
      const firebaseUser = await verifyFirebaseToken(firebaseUid);
      
      if (firebaseUser.email !== email) {
        throw createError('Email mismatch with Firebase token', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { firebaseUid }
          ]
        }
      });

      if (existingUser) {
        throw createError('User already exists', 409);
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          firebaseUid,
          isVerified: firebaseUser.email_verified || false,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Create role-specific profile
      if (role === 'EVENT_PLANNER') {
        await prisma.eventPlanner.create({
          data: { userId: user.id },
        });
      } else if (role === 'CREATIVE_PROFESSIONAL') {
        await prisma.creativeProfile.create({
          data: { userId: user.id },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw createError('Invalid or inactive user', 401);
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      throw createError('Invalid token', 401);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          location: true,
          bio: true,
          avatar: true,
          phone: true,
          isVerified: true,
          language: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      throw error;
    }
  }
}
EOF

# Create User Controller
cat > backend/src/controllers/user/userController.ts << 'EOF'
import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          eventPlanner: true,
          creativeProfile: {
            include: {
              receivedReviews: {
                include: {
                  reviewer: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    },
                  },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
            },
          },
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, bio, location, phone } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          bio,
          location,
          phone,
        },
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          location: true,
          phone: true,
          avatar: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      // File is already uploaded to Cloudinary via middleware
      const avatarUrl = (req.file as any).path;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });

      res.json({
        success: true,
        message: 'Avatar updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      throw error;
    }
  }

  async deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: 'Account deactivated successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}
EOF

# Create Event Controller
cat > backend/src/controllers/event/eventController.ts << 'EOF'
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
EOF

# Create Booking Controller
cat > backend/src/controllers/booking/bookingController.ts << 'EOF'
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
EOF

echo "✅ Backend controller files created!"