import { Response } from 'express';
import { users, UserRole, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';

export class AdminController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const [
      totaluserss,
      totalEvents,
      totalBookings,
      totalReviews,
      activeuserss,
      // pendingReports,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.events.count(),
      prisma.bookings.count(),
      prisma.reviews.count(),
      prisma.users.count({ where: { isActive: true } }),
      // prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    const [usersByRole, eventsByType, bookingsByStatus] = await Promise.all([
      prisma.users.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.events.groupBy({
        by: ['eventType'],
        _count: true
      }),
      prisma.bookings.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    const [eventPlannerCount, creativeProfileCount] = await Promise.all([
      prisma.event_planners.count(),
      prisma.creative_profiles.count()
    ]);

    res.json({
      success: true,
      stats: {
        totaluserss,
        totalEvents,
        totalBookings,
        totalReviews,
        activeuserss,
        // pendingReports: 0, // Report table not implemented
        usersByRole,
        eventsByType,
        bookingsByStatus,
        eventPlannerCount,
        creativeProfileCount
      }
    });
  }

  async getUserss(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: Prisma.usersWhereInput = {};

    if (role) where.role = role as UserRole;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          event_planners: true,
          creative_profiles: true,
        }
      }),
      prisma.users.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  }

  async updateusersStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await prisma.users.findUnique({
        where: { id },
      });

      if (!user) {
        throw createError('users not found', 404);
      }

      if (user.role === 'ADMIN') {
        throw createError('Cannot modify admin user status', 403);
      }

      const updatedusers = await prisma.users.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      });

      res.json({
        success: true,
        message: `users ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: updatedusers,
      });
    } catch (error) {
      throw error;
    }
  }

  async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        featured,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (status) where.status = status;
      if (featured !== undefined) where.isFeatured = featured === 'true';

      const [events, total] = await Promise.all([
        prisma.events.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            event_planners: {
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                event_applications: true,
                bookings: true,
              },
            },
          },
        }),
        prisma.events.count({ where }),
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

  async updateEventFeatured(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;

      const event = await prisma.events.findUnique({
        where: { id },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      const updatedEvent = await prisma.events.update({
        where: { id },
        data: { isFeatured },
        select: {
          id: true,
          title: true,
          isFeatured: true,
        },
      });

      res.json({
        success: true,
        message: `Event ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
        event: updatedEvent,
      });
    } catch (error) {
      throw error;
    }
  }

  async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        targetType,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (status) where.status = status;
      if (targetType) where.targetType = targetType;

      const [reports, total] = await Promise.all([
        // prisma.report.findMany({
        //   where,
        //   skip,
        //   take: Number(limit),
        //   orderBy: { createdAt: 'desc' },
        //   include: {
        //     reporter: {
        //       select: {
        //         id: true,
        //         name: true,
        //         email: true,
        //       },
        //     },
        //     resolver: {
        //       select: {
        //         id: true,
        //         name: true,
        //       },
        //     },
        //   },
        // }),
        Promise.resolve([]),
        // prisma.report.count({ where }),
        Promise.resolve(0),
      ]);

      res.json({
        success: true,
        reports,
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

  async updateReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, action, notes } = req.body;

      // Report functionality not implemented
      res.status(404).json({
        success: false,
        message: 'Report functionality not implemented'
      });
      
      /*
      const report = await prisma.report.findUnique({
        where: { id },
      });

      if (!report) {
        throw createError('Report not found', 404);
      }

      const updatedReport = await prisma.report.update({
        where: { id },
        data: {
          status,
          action,
          notes,
          resolvedAt: status !== 'PENDING' ? new Date() : null,
          resolvedBy: status !== 'PENDING' ? req.user!.id : null,
        },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          resolver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Report updated successfully',
        report: updatedReport,
      });
      */
    } catch (error) {
      throw error;
    }
  }

  async updateusers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const user = await prisma.users.update({
        where: { id },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'users updated successfully',
        user,
      });
    } catch (error) {
      throw error;
    }
  }

  async resolveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Report functionality not implemented
    res.status(404).json({
      success: false,
      message: 'Report functionality not implemented'
    });
  }
}
