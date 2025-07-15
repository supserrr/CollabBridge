import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';

export class SearchController {
  async searchProfessionals(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        categories,
        location,
        minRate,
        maxRate,
        skills,
        availability,
        rating,
        experience,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {
        user: {
          isActive: true,
          isVerified: true,
        },
      };

      if (categories) {
        const categoryArray = Array.isArray(categories) ? categories : [categories];
        where.categories = {
          hasSome: categoryArray,
        };
      }

      if (location) {
        where.user = {
          ...where.user,
          location: {
            contains: location as string,
            mode: 'insensitive',
          },
        };
      }

      if (minRate || maxRate) {
        where.hourlyRate = {};
        if (minRate) where.hourlyRate.gte = Number(minRate);
        if (maxRate) where.hourlyRate.lte = Number(maxRate);
      }

      if (skills) {
        const skillArray = Array.isArray(skills) ? skills : [skills];
        where.skills = {
          hasSome: skillArray,
        };
      }

      if (availability === 'available') {
        where.isAvailable = true;
      }

      // Build order by clause
      const orderBy: any = {};
      if (sortBy === 'rating') {
        // This would require a more complex query with rating aggregation
        orderBy.createdAt = sortOrder;
      } else if (sortBy === 'hourlyRate') {
        orderBy.hourlyRate = sortOrder;
      } else if (sortBy === 'completedProjects') {
        orderBy.completedProjects = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
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
                createdAt: true,
                receivedReviews: {
                  select: {
                    rating: true,
                  },
                },
              },
            },
            certifications: {
              select: {
                name: true,
                issuingOrganization: true,
                verifiedAt: true,
              },
            },
            _count: {
              select: {
                applications: true,
                bookings: true,
              },
            },
          },
          orderBy,
          skip,
          take: Number(limit),
        }),
        prisma.creativeProfile.count({ where }),
      ]);

      // Calculate average ratings
      const professionalsWithRatings = professionals.map((prof) => {
        const reviews = prof.user.receivedReviews;
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

        return {
          ...prof,
          user: {
            ...prof.user,
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: reviews.length,
            receivedReviews: undefined, // Remove from response
          },
        };
      });

      res.json({
        professionals: professionalsWithRatings,
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

  async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        eventType,
        location,
        dateFrom,
        dateTo,
        minBudget,
        maxBudget,
        requiredRoles,
        tags,
        sortBy = 'date',
        sortOrder = 'asc',
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {
        isPublic: true,
        status: 'ACTIVE',
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

      if (minBudget || maxBudget) {
        where.budget = {};
        if (minBudget) where.budget.gte = Number(minBudget);
        if (maxBudget) where.budget.lte = Number(maxBudget);
      }

      if (requiredRoles) {
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        where.requiredRoles = {
          hasSome: rolesArray,
        };
      }

      if (tags) {
        const tagsArray = Array.isArray(tags) ? tags : [tags];
        where.tags = {
          hasSome: tagsArray,
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
            { [sortBy as string]: sortOrder },
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

  async getLocations(req: Request, res: Response): Promise<void> {
    try {
      // Get unique locations from users and events
      const [userLocations, eventLocations] = await Promise.all([
        prisma.user.findMany({
          where: {
            isActive: true,
            location: { not: null },
          },
          select: { location: true },
          distinct: ['location'],
        }),
        prisma.event.findMany({
          where: {
            isPublic: true,
            status: 'ACTIVE',
            location: { not: null },
          },
          select: { location: true },
          distinct: ['location'],
        }),
      ]);

      const allLocations = [
        ...userLocations.map(u => u.location),
        ...eventLocations.map(e => e.location),
      ].filter(Boolean);

      const uniqueLocations = [...new Set(allLocations)].sort();

      res.json(uniqueLocations);
    } catch (error) {
      throw error;
    }
  }

  async getNearbyProfessionals(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, radius = 50, limit = 20 } = req.query;

      if (!latitude || !longitude) {
        throw createError('Latitude and longitude are required', 400);
      }

      // This would require PostGIS or similar for proper geographic queries
      // For now, return professionals sorted by location match
      const professionals = await prisma.creativeProfile.findMany({
        where: {
          user: {
            isActive: true,
            isVerified: true,
          },
          isAvailable: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              location: true,
              avatar: true,
              receivedReviews: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        take: Number(limit),
      });

      // Calculate average ratings
      const professionalsWithRatings = professionals.map((prof) => {
        const reviews = prof.user.receivedReviews;
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

        return {
          ...prof,
          user: {
            ...prof.user,
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: reviews.length,
            receivedReviews: undefined,
          },
        };
      });

      res.json({
        professionals: professionalsWithRatings,
      });
    } catch (error) {
      throw error;
    }
  }
}
