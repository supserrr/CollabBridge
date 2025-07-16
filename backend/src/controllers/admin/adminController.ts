import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';

export class AdminController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalReviews,
      activeUsers,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    const eventsByType = await prisma.event.groupBy({
      by: ['eventType'],
      _count: { eventType: true },
    });

    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalReviews,
        activeUsers,
        pendingReports,
        usersByRole,
        eventsByType,
        bookingsByStatus,
      },
    });
  }

  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          location: true,
          isActive: true,
          isVerified: true,
          lastActiveAt: true,
          createdAt: true,
          _count: {
            select: {
              eventPlanner: true,
              creativeProfile: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role === 'ADMIN') {
        throw createError('Cannot modify admin user status', 403);
      }

      const updatedUser = await prisma.user.update({
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
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: updatedUser,
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
        prisma.event.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            eventPlanner: {
              include: {
                user: {
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

  async updateEventFeatured(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;

      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw createError('Event not found', 404);
      }

      const updatedEvent = await prisma.event.update({
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
        prisma.report.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
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
        }),
        prisma.report.count({ where }),
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
    } catch (error) {
      throw error;
    }
  }
}
