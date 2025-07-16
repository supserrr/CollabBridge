import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';

export class SearchController {
  async searchProfessionals(req: Request, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 20,
      categories,
      skills,
      location,
      minRate,
      maxRate,
      availability,
      rating,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      user: {
        isActive: true,
        role: 'CREATIVE_PROFESSIONAL',
      },
      isAvailable: true,
    };

    if (categories) {
      where.categories = {
        hasSome: Array.isArray(categories) ? categories : [categories],
      };
    }

    if (skills) {
      where.skills = {
        hasSome: Array.isArray(skills) ? skills : [skills],
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

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            bio: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        },
        {
          skills: {
            hasSome: [search as string],
          },
        },
      ];
    }

    const professionals = await prisma.creativeProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            bio: true,
          },
        },
        receivedReviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            receivedReviews: true,
            bookings: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      orderBy: [
        { user: { lastActiveAt: 'desc' } },
        { createdAt: 'desc' },
      ],
      skip,
      take: Number(limit),
    });

    // Calculate average ratings
    const professionalWithRatings = professionals.map(prof => {
      const avgRating = prof.receivedReviews.length > 0
        ? prof.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / prof.receivedReviews.length
        : 0;

      return {
        ...prof,
        avgRating: Number(avgRating.toFixed(1)),
        reviewCount: prof._count.receivedReviews,
        completedBookings: prof._count.bookings,
      };
    });

    const total = await prisma.creativeProfile.count({ where });

    res.json({
      professionals: professionalWithRatings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async searchEvents(req: Request, res: Response): Promise<void> {
    const {
      page = 1,
      limit = 20,
      eventType,
      location,
      minBudget,
      maxBudget,
      requiredRoles,
      tags,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      status: 'PUBLISHED',
      isPublic: true,
      startDate: {
        gte: new Date(),
      },
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

    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget.gte = Number(minBudget);
      if (maxBudget) where.budget.lte = Number(maxBudget);
    }

    if (requiredRoles) {
      where.requiredRoles = {
        hasSome: Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
      };
    }

    if (tags) {
      where.tags = {
        hasSome: Array.isArray(tags) ? tags : [tags],
      };
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    const events = await prisma.event.findMany({
      where,
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
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: Number(limit),
    });

    const total = await prisma.event.count({ where });

    res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async getSearchFilters(req: Request, res: Response): Promise<void> {
    // Get unique categories
    const categories = await prisma.creativeProfile.findMany({
      select: {
        categories: true,
      },
      distinct: ['categories'],
    });

    const uniqueCategories = [...new Set(categories.flatMap(p => p.categories))];

    // Get unique skills
    const skills = await prisma.creativeProfile.findMany({
      select: {
        skills: true,
      },
      distinct: ['skills'],
    });

    const uniqueSkills = [...new Set(skills.flatMap(p => p.skills))];

    // Get unique locations
    const locations = await prisma.user.findMany({
      select: {
        location: true,
      },
      where: {
        location: {
          not: null,
        },
      },
      distinct: ['location'],
    });

    const uniqueLocations = locations.map(l => l.location).filter(Boolean);

    // Get rate ranges
    const rateStats = await prisma.creativeProfile.aggregate({
      _min: {
        hourlyRate: true,
      },
      _max: {
        hourlyRate: true,
      },
      _avg: {
        hourlyRate: true,
      },
    });

    res.json({
      categories: uniqueCategories.sort(),
      skills: uniqueSkills.sort(),
      locations: uniqueLocations.sort(),
      rateRange: {
        min: rateStats._min.hourlyRate || 0,
        max: rateStats._max.hourlyRate || 1000,
        avg: rateStats._avg.hourlyRate || 100,
      },
    });
  }
}
