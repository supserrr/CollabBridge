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
      publishedEvents,
      completedBookings,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    // Get user growth data (last 12 months)
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      },
    });

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalReviews,
        activeUsers,
        publishedEvents,
        completedBookings,
        pendingReports,
      },
      userGrowth,
    });
  }

  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, role, isActive, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    const users = await prisma.user.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { isActive, isVerified } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive,
        isVerified,
        updatedAt: new Date(),
      },
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  }

  async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, status, targetType } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    const reports = await prisma.report.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    const total = await prisma.report.count({ where });

    res.json({
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async resolveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, action, notes } = req.body;
    const userId = req.user!.id;

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status,
        action,
        notes,
        resolvedAt: new Date(),
        resolvedBy: userId,
      },
    });

    res.json({
      message: 'Report resolved successfully',
      report: updatedReport,
    });
  }
}
