import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class SearchController {
  async searchProfessionals(req: Request, res: Response): Promise<void> {
    try {
      const {
        query = '',
        categories,
        location,
        minRating = 0,
        maxRate,
        isAvailable,
        page = 1,
        limit = 12,
        sortBy = 'relevance',
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      let where: any = {
        user: {
          isActive: true,
          role: 'CREATIVE_PROFESSIONAL',
        },
      };

      // Text search
      if (query) {
        where.OR = [
          { user: { name: { contains: query as string, mode: 'insensitive' } } },
          { user: { bio: { contains: query as string, mode: 'insensitive' } } },
          { experience: { contains: query as string, mode: 'insensitive' } },
        ];
      }

      // Filter by categories
      if (categories) {
        const categoryArray = Array.isArray(categories) ? categories : [categories];
        where.categories = {
          hasSome: categoryArray,
        };
      }

      // Filter by location
      if (location) {
        where.user.location = {
          contains: location as string,
          mode: 'insensitive',
        };
      }

      // Filter by availability
      if (isAvailable === 'true') {
        where.isAvailable = true;
      }

      // Filter by hourly rate
      if (maxRate) {
        where.hourlyRate = {
          lte: Number(maxRate),
        };
      }

      let orderBy: any = {};

      switch (sortBy) {
        case 'rate_low':
          orderBy = { hourlyRate: 'asc' };
          break;
        case 'rate_high':
          orderBy = { hourlyRate: 'desc' };
          break;
        case 'newest':
          orderBy = { user: { createdAt: 'desc' } };
          break;
        default:
          orderBy = { user: { createdAt: 'desc' } };
      }

      const [professionals, total] = await Promise.all([
        prisma.creativeProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                location: true,
                avatar: true,
                bio: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                bookings: {
                  where: { status: 'COMPLETED' },
                },
              },
            },
          },
          orderBy,
          skip,
          take: Number(limit),
        }),
        prisma.creativeProfile.count({ where }),
      ]);

      // Get ratings for each professional
      const professionalsWithRatings = await Promise.all(
        professionals.map(async (professional) => {
          const ratings = await prisma.review.aggregate({
            where: { receiverId: professional.user.id },
            _avg: { rating: true },
            _count: { rating: true },
          });

          const averageRating = ratings._avg.rating || 0;

          // Apply rating filter if specified
          if (Number(minRating) > 0 && averageRating < Number(minRating)) {
            return null;
          }

          return {
            ...professional,
            averageRating,
            totalReviews: ratings._count.rating,
            completedProjects: professional._count.bookings,
          };
        })
      );

      // Filter out null results (those that didn't meet rating criteria)
      const filteredProfessionals = professionalsWithRatings.filter(Boolean);

      res.json({
        professionals: filteredProfessionals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredProfessionals.length,
          pages: Math.ceil(filteredProfessionals.length / Number(limit)),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const {
        query = '',
        eventType,
        location,
        dateFrom,
        dateTo,
        budgetMin,
        budgetMax,
        requiredRoles,
        page = 1,
        limit = 12,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      let where: any = {
        isPublic: true,
        status: 'ACTIVE',
        date: {
          gte: new Date(),
        },
      };

      // Text search
      if (query) {
        where.OR = [
          { title: { contains: query as string, mode: 'insensitive' } },
          { description: { contains: query as string, mode: 'insensitive' } },
          { location: { contains: query as string, mode: 'insensitive' } },
        ];
      }

      // Filter by event type
      if (eventType) {
        where.eventType = eventType;
      }

      // Filter by location
      if (location) {
        where.location = {
          contains: location as string,
          mode: 'insensitive',
        };
      }

      // Filter by date range
      if (dateFrom) {
        where.date.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo as string);
      }

      // Filter by budget range
      if (budgetMin || budgetMax) {
        where.budget = {};
        if (budgetMin) where.budget.gte = Number(budgetMin);
        if (budgetMax) where.budget.lte = Number(budgetMax);
      }

      // Filter by required roles
      if (requiredRoles) {
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        where.requiredRoles = {
          hasSome: rolesArray,
        };
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

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      // Get unique categories from creative profiles
      const result = await prisma.$queryRaw<Array<{ category: string; count: number }>>`
        SELECT 
          unnest(categories) as category,
          COUNT(*) as count
        FROM creative_profiles cp
        JOIN users u ON cp.user_id = u.id
        WHERE u.is_active = true
        GROUP BY category
        ORDER BY count DESC, category ASC
      `;

      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async getEventTypes(req: Request, res: Response): Promise<void> {
    try {
      const eventTypes = await prisma.event.groupBy({
        by: ['eventType'],
        where: {
          isPublic: true,
          status: 'ACTIVE',
        },
        _count: {
          eventType: true,
        },
        orderBy: {
          _count: {
            eventType: 'desc',
          },
        },
      });

      res.json(eventTypes);
    } catch (error) {
      throw error;
    }
  }
}
