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
          isActive: true,
          isVerified: true,
          createdAt: true,
          lastActiveAt: true,
          _count: {
            select: {
              receivedReviews: true,
              givenReviews: true,
            }
          }
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
    const { id } = req.params;
    const { isActive, reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    // Log admin action
    await prisma.userActivity.create({
      data: {
        userId: id,
        action: isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
        metadata: {
          reason,
          adminId: req.user!.id,
        },
      },
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  }

  async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 20,
      type,
      status,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (type) where.targetType = type.toString().toUpperCase();
    if (status) where.status = status.toString().toUpperCase();

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
            }
          }
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
  }

  async handleReport(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        resolvedAt: new Date(),
        resolvedBy: req.user!.id,
      },
    });

    res.json({
      success: true,
      message: 'Report handled successfully',
      report: updatedReport,
    });
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      };
    } else {
      const now = new Date();
      let start: Date;
      
      switch (period) {
        case 'day':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      dateFilter = {
        createdAt: { gte: start },
      };
    }

    const [
      userGrowth,
      eventGrowth,
      bookingGrowth,
      revenue,
    ] = await Promise.all([
      prisma.user.count({ where: dateFilter }),
      prisma.event.count({ where: dateFilter }),
      prisma.booking.count({ where: dateFilter }),
      prisma.payment.aggregate({
        where: dateFilter,
        _sum: { amount: true },
      }),
    ]);

    res.json({
      success: true,
      analytics: {
        userGrowth,
        eventGrowth,
        bookingGrowth,
        revenue: revenue._sum.amount || 0,
        period,
      },
    });
  }
}
