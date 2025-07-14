import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticateUser, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateUser);
router.use(requireRole(['ADMIN']));

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalReviews,
      activeUsers,
      recentUsers,
      recentEvents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.event.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalReviews,
      activeUsers,
      recentUsers,
      recentEvents,
    });
  } catch (error) {
    throw error;
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          location: true,
          createdAt: true,
          _count: {
            select: {
              receivedReviews: true,
              eventPlanner: {
                select: {
                  events: true,
                },
              },
              creativeProfile: {
                select: {
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
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
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
});

router.put('/users/:id/status', [
  param('id').isUUID(),
  body('isActive').isBoolean(),
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    throw error;
  }
});

// Content moderation
router.get('/reports', async (req, res) => {
  try {
    // This would typically involve a reports table
    // For now, we'll return a placeholder
    res.json({ reports: [], message: 'Report system not implemented yet' });
  } catch (error) {
    throw error;
  }
});

export { router as adminRoutes };
