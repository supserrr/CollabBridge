import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { uploadToCloudinary } from '../config/cloudinary';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { EventStatus, ApplicationStatus, BookingStatus, UserRole } from '@prisma/client';

export class EventController {
  async getPublicEvents(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        eventType, 
        location, 
        dateFrom, 
        dateTo,
        budget,
        featured 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {
        isPublic: true,
        status: EventStatus.ACTIVE,
      };

      if (eventType) {
        where.eventType = eventType;
      }

      if (location) {
        where.location = {
          contains: location as string,
          mode: 'insensitive',
        };
      }

      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom as string);
        if (dateTo) where.date.lte = new Date(dateTo as string);
      }

      if (budget) {
        where.budget = {
          lte: Number(budget),
        };
      }

      if (featured === 'true') {
        where.isFeatured = true;
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            planner: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    location: true,
                    avatar: true,
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
          orderBy: [
            { isFeatured: 'desc' },
            { date: 'asc' },
          ],
          skip,
          take: Number(limit),
        }),
        prisma.event.count({ where }),
      ]);

      res.json({
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

  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          planner: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  location: true,
                  avatar: true,
                  createdAt: true,
                },
              },
            },
          },
          applications: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              creative: {
                select: {
                  categories: true,
                  hourlyRate: true,
                  skills: true,
                },
              },
            },
            orderBy: { appliedAt: 'desc' },
          },
          bookings: {
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
              bookings: true,
              favorites: true,
            },
          },
        },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      // Check if event is public or user has access
      if (!event.isPublic) {
        // Additional access checks would go here
      }

      res.json({ event });
    } catch (error) {
      throw error;
    }
  }

  async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      if (req.user.role !== UserRole.EVENT_PLANNER) {
        throw createError('Only event planners can create events', 403);
      }

      const {
        title,
        description,
        eventType,
        date,
        endDate,
        location,
        address,
        budget,
        minBudget,
        maxBudget,
        requiredRoles,
        tags,
        isPublic = true,
      } = req.body;

      // Get event planner profile
      const eventPlanner = await prisma.eventPlanner.findUnique({
        where: { userId: req.user.id },
      });

      if (!eventPlanner) {
        throw createError('Event planner profile not found', 404);
      }

      // Handle image uploads
      let imageUrls: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map((file: Express.Multer.File) =>
          uploadToCloudinary(file.buffer, 'events', {
            width: 1200,
            height: 800,
            crop: 'limit',
          })
        );
        const results = await Promise.all(uploadPromises);
        imageUrls = results.map((result) => result.secure_url);
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          eventType,
          date: new Date(date),
          endDate: endDate ? new Date(endDate) : null,
          location,
          address,
          budget: budget ? parseFloat(budget) : null,
          minBudget: minBudget ? parseFloat(minBudget) : null,
          maxBudget: maxBudget ? parseFloat(maxBudget) : null,
          requiredRoles: Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
          images: imageUrls,
          tags: Array.isArray(tags) ? tags : [],
          isPublic,
          plannerId: eventPlanner.id,
        },
        include: {
          planner: {
            include: {
              user: {
                select: {
                  name: true,
                  location: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json({
        message: 'Event created successfully',
        event,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      const updateData = { ...req.body };

      // Verify ownership
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          planner: {
            select: { userId: true },
          },
        },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.planner.userId !== req.user.id) {
        throw createError('Not authorized to update this event', 403);
      }

      // Handle image uploads
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map((file: Express.Multer.File) =>
          uploadToCloudinary(file.buffer, 'events', {
            width: 1200,
            height: 800,
            crop: 'limit',
          })
        );
        const results = await Promise.all(uploadPromises);
        const newImageUrls = results.map((result) => result.secure_url);
        updateData.images = [...(event.images || []), ...newImageUrls];
      }

      // Convert date strings
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: updateData,
        include: {
          planner: {
            include: {
              user: {
                select: {
                  name: true,
                  location: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      res.json({
        message: 'Event updated successfully',
        event: updatedEvent,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;

      // Verify ownership
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          planner: {
            select: { userId: true },
          },
        },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.planner.userId !== req.user.id) {
        throw createError('Not authorized to delete this event', 403);
      }

      await prisma.event.delete({
        where: { id },
      });

      res.json({
        message: 'Event deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  async getMyEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { page = 1, limit = 20, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      if (req.user.role === UserRole.EVENT_PLANNER) {
        const eventPlanner = await prisma.eventPlanner.findUnique({
          where: { userId: req.user.id },
        });

        if (!eventPlanner) {
          throw createError('Event planner profile not found', 404);
        }

        const where: any = { plannerId: eventPlanner.id };
        if (status) {
          where.status = status;
        }

        const [events, total] = await Promise.all([
          prisma.event.findMany({
            where,
            include: {
              _count: {
                select: {
                  applications: true,
                  bookings: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
          }),
          prisma.event.count({ where }),
        ]);

        res.json({
          events,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        });
      } else {
        // For creative professionals, return events they applied to or are booked for
        const [applications, bookings] = await Promise.all([
          prisma.eventApplication.findMany({
            where: { userId: req.user.id },
            include: {
              event: {
                include: {
                  planner: {
                    include: {
                      user: {
                        select: {
                          name: true,
                          location: true,
                          avatar: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { appliedAt: 'desc' },
            skip,
            take: Number(limit),
          }),
          prisma.booking.findMany({
            where: { userId: req.user.id },
            include: {
              event: {
                include: {
                  planner: {
                    include: {
                      user: {
                        select: {
                          name: true,
                          location: true,
                          avatar: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

        res.json({
          applications,
          bookings,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async applyToEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      if (req.user.role !== UserRole.CREATIVE_PROFESSIONAL) {
        throw createError('Only creative professionals can apply to events', 403);
      }

      const { id } = req.params;
      const { message, proposedRate, portfolio } = req.body;

      // Get creative profile
      const creativeProfile = await prisma.creativeProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!creativeProfile) {
        throw createError('Creative profile not found', 404);
      }

      // Check if event exists and is active
      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.status !== EventStatus.ACTIVE) {
        throw createError('Cannot apply to inactive event', 400);
      }

      // Check if already applied
      const existingApplication = await prisma.eventApplication.findUnique({
        where: {
          eventId_creativeId: {
            eventId: id,
            creativeId: creativeProfile.id,
          },
        },
      });

      if (existingApplication) {
        throw createError('Already applied to this event', 409);
      }

      const application = await prisma.eventApplication.create({
        data: {
          eventId: id,
          creativeId: creativeProfile.id,
          userId: req.user.id,
          message,
          proposedRate: proposedRate ? parseFloat(proposedRate) : null,
          portfolio: Array.isArray(portfolio) ? portfolio : [],
        },
        include: {
          event: {
            select: {
              title: true,
              date: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Application submitted successfully',
        application,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { eventId, applicationId } = req.params;
      const { status, feedback } = req.body;

      // Verify event ownership
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          planner: {
            select: { userId: true },
          },
        },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.planner.userId !== req.user.id) {
        throw createError('Not authorized to update applications for this event', 403);
      }

      const updatedApplication = await prisma.eventApplication.update({
        where: { id: applicationId },
        data: {
          status,
          respondedAt: new Date(),
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          event: {
            select: {
              title: true,
            },
          },
        },
      });

      res.json({
        message: 'Application updated successfully',
        application: updatedApplication,
      });
    } catch (error) {
      throw error;
    }
  }

  async createBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      const { creativeId, agreedRate, notes, startDate, endDate } = req.body;

      // Get event planner profile
      const eventPlanner = await prisma.eventPlanner.findUnique({
        where: { userId: req.user.id },
      });

      if (!eventPlanner) {
        throw createError('Event planner profile not found', 404);
      }

      // Verify event ownership
      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.plannerId !== eventPlanner.id) {
        throw createError('Not authorized to create bookings for this event', 403);
      }

      // Check if creative professional exists
      const creative = await prisma.creativeProfile.findUnique({
        where: { id: creativeId },
      });

      if (!creative) {
        throw createError('Creative professional not found', 404);
      }

      // Check if already booked
      const existingBooking = await prisma.booking.findUnique({
        where: {
          eventId_creativeId: {
            eventId: id,
            creativeId,
          },
        },
      });

      if (existingBooking) {
        throw createError('Creative professional already booked for this event', 409);
      }

      const booking = await prisma.booking.create({
        data: {
          eventId: id,
          plannerId: eventPlanner.id,
          creativeId,
          userId: creative.userId,
          agreedRate: agreedRate ? parseFloat(agreedRate) : null,
          notes,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
        include: {
          event: {
            select: {
              title: true,
              date: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
      });
    } catch (error) {
      throw error;
    }
  }

  async getEventBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          planner: {
            select: { userId: true },
          },
        },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      if (event.planner.userId !== req.user.id) {
        throw createError('Not authorized to view bookings for this event', 403);
      }

      const bookings = await prisma.booking.findMany({
        where: { eventId: id },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
              location: true,
            },
          },
          creative: {
            select: {
              categories: true,
              hourlyRate: true,
              skills: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ bookings });
    } catch (error) {
      throw error;
    }
  }

  async getMyApplications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { page = 1, limit = 20, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { userId: req.user.id };
      if (status) {
        where.status = status;
      }

      const [applications, total] = await Promise.all([
        prisma.eventApplication.findMany({
          where,
          include: {
            event: {
              include: {
                planner: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        location: true,
                        avatar: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.eventApplication.count({ where }),
      ]);

      res.json({
        applications,
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

  async toggleFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;

      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_eventId: {
            userId: req.user.id,
            eventId: id,
          },
        },
      });

      if (existingFavorite) {
        await prisma.favorite.delete({
          where: { id: existingFavorite.id },
        });

        res.json({
          message: 'Event removed from favorites',
          isFavorited: false,
        });
      } else {
        await prisma.favorite.create({
          data: {
            userId: req.user.id,
            eventId: id,
          },
        });

        res.json({
          message: 'Event added to favorites',
          isFavorited: true,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async getFavorites(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [favorites, total] = await Promise.all([
        prisma.favorite.findMany({
          where: { userId: req.user.id },
          include: {
            event: {
              include: {
                planner: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        location: true,
                        avatar: true,
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
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.favorite.count({
          where: { userId: req.user.id },
        }),
      ]);

      res.json({
        favorites,
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
}
