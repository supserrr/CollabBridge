import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';
import { EventType, EventStatus, ApplicationStatus } from '@prisma/client';

export class EventController {
  async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 20,
      eventType,
      location,
      dateFrom,
      dateTo,
      minBudget,
      maxBudget,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      status: EventStatus.PUBLISHED,
      startDate: { gte: new Date() }, // Only future events
    };

    if (eventType) where.eventType = eventType;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (dateFrom) where.startDate = { ...where.startDate, gte: new Date(dateFrom as string) };
    if (dateTo) where.endDate = { lte: new Date(dateTo as string) };
    if (minBudget) where.budget = { gte: Number(minBudget) };
    if (maxBudget) where.budget = { ...where.budget, lte: Number(maxBudget) };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { startDate: 'asc' },
        include: {
          eventPlanner: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  location: true,
                }
              }
            }
          },
          _count: {
            select: {
              applications: true,
            }
          }
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
                location: true,
                bio: true,
                createdAt: true,
              }
            }
          }
        },
        applications: req.user?.role === 'EVENT_PLANNER' ? {
          include: {
            professional: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    location: true,
                  }
                }
              }
            }
          }
        } : undefined,
        _count: {
          select: {
            applications: true,
          }
        }
      },
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    // Check if current user has applied (for creative professionals)
    let hasApplied = false;
    if (req.user?.role === 'CREATIVE_PROFESSIONAL') {
      const application = await prisma.eventApplication.findFirst({
        where: {
          eventId: id,
          professionalId: req.user.id,
        }
      });
      hasApplied = !!application;
    }

    res.json({
      success: true,
      event: {
        ...event,
        hasApplied,
      },
    });
  }

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
      maxApplicants,
      tags,
    } = req.body;

    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw createError('Event planner profile not found', 404);
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        budget,
        requiredRoles,
        maxApplicants,
        tags: tags || [],
        eventPlannerId: eventPlanner.id,
        status: EventStatus.PUBLISHED,
      },
      include: {
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
      message: 'Event created successfully',
      event,
    });
  }

  async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventPlanner: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.eventPlanner.userId !== userId) {
      throw createError('Unauthorized to update this event', 403);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
      },
      include: {
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
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  }

  async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventPlanner: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.eventPlanner.userId !== userId) {
      throw createError('Unauthorized to delete this event', 403);
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  }

  async getMyEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const eventPlanner = await prisma.eventPlanner.findUnique({
      where: { userId },
    });

    if (!eventPlanner) {
      throw createError('Event planner profile not found', 404);
    }

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
            }
          }
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
  }

  async applyToEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id: eventId } = req.params;
    const userId = req.user!.id;
    const { message, proposedRate } = req.body;

    // Get creative profile
    const creativeProfile = await prisma.creativeProfile.findUnique({
      where: { userId },
    });

    if (!creativeProfile) {
      throw createError('Creative profile not found', 404);
    }

    // Check if event exists and is accepting applications
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw createError('Event is not accepting applications', 400);
    }

    if (event.maxApplicants && event._count.applications >= event.maxApplicants) {
      throw createError('Event has reached maximum applicants', 400);
    }

    // Check if already applied
    const existingApplication = await prisma.eventApplication.findFirst({
      where: {
        eventId,
        professionalId: creativeProfile.id,
      }
    });

    if (existingApplication) {
      throw createError('Already applied to this event', 409);
    }

    const application = await prisma.eventApplication.create({
      data: {
        eventId,
        professionalId: creativeProfile.id,
        message,
        proposedRate,
        status: ApplicationStatus.PENDING,
      },
      include: {
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
        event: {
          select: {
            id: true,
            title: true,
          }
        }
      },
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  }

  async getEventApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id: eventId } = req.params;
    const userId = req.user!.id;
    const { status } = req.query;

    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventPlanner: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.eventPlanner.userId !== userId) {
      throw createError('Unauthorized to view applications', 403);
    }

    const where: any = { eventId };
    if (status) where.status = status;

    const applications = await prisma.eventApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                location: true,
                bio: true,
              }
            },
            _count: {
              select: {
                receivedReviews: true,
                bookings: true,
              }
            }
          }
        }
      },
    });

    res.json({
      success: true,
      applications,
    });
  }

  async updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { eventId, applicationId } = req.params;
    const userId = req.user!.id;
    const { status, response } = req.body;

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventPlanner: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.eventPlanner.userId !== userId) {
      throw createError('Unauthorized to update application', 403);
    }

    const application = await prisma.eventApplication.update({
      where: { id: applicationId },
      data: {
        status,
        response,
        respondedAt: new Date(),
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        event: {
          select: {
            id: true,
            title: true,
          }
        }
      },
    });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application,
    });
  }
}
