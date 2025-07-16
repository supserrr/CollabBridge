import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';

export class SearchController {
  async searchProfessionals(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      q,
      categories,
      location,
      minRate,
      maxRate,
      skills,
      availability,
      rating,
      page = 1,
      limit = 20,
      sortBy = 'rating',
      sortOrder = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      user: {
        isActive: true,
        role: 'CREATIVE_PROFESSIONAL',
      },
    };

    if (q) {
      where.OR = [
        { user: { name: { contains: q as string, mode: 'insensitive' } } },
        { user: { bio: { contains: q as string, mode: 'insensitive' } } },
        { skills: { hasSome: [q as string] } },
      ];
    }

    if (categories && Array.isArray(categories)) {
      where.categories = { hasSome: categories };
    }

    if (location) {
      where.user = {
        ...where.user,
        location: { contains: location as string, mode: 'insensitive' },
      };
    }

    if (minRate) {
      where.hourlyRate = { gte: Number(minRate) };
    }

    if (maxRate) {
      where.hourlyRate = { ...where.hourlyRate, lte: Number(maxRate) };
    }

    if (skills && Array.isArray(skills)) {
      where.skills = { hasSome: skills };
    }

    if (availability === 'true') {
      where.isAvailable = true;
    }

    const orderBy: any = {};
    if (sortBy === 'rating') {
      // Will be handled separately with aggregation
    } else if (sortBy === 'rate') {
      orderBy.hourlyRate = sortOrder;
    } else if (sortBy === 'experience') {
      orderBy.createdAt = 'asc'; // Older profiles = more experience
    } else if (sortBy === 'responseTime') {
      orderBy.responseTime = 'asc';
    }

    const professionals = await prisma.creativeProfile.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: orderBy.hourlyRate ? orderBy : { user: { createdAt: 'desc' } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            bio: true,
            lastActiveAt: true,
          }
        },
        _count: {
          select: {
            receivedReviews: true,
            bookings: true,
          }
        }
      },
    });

    // Calculate average ratings
    const professionalsWithRatings = await Promise.all(
      professionals.map(async (professional) => {
        const avgRating = await prisma.review.aggregate({
          where: { revieweeId: professional.userId },
          _avg: { rating: true },
        });

        return {
          ...professional,
          averageRating: avgRating._avg.rating || 0,
        };
      })
    );

    // Sort by rating if requested
    if (sortBy === 'rating') {
      professionalsWithRatings.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.averageRating - a.averageRating
          : a.averageRating - b.averageRating;
      });
    }

    // Filter by minimum rating if specified
    const filteredProfessionals = rating 
      ? professionalsWithRatings.filter(p => p.averageRating >= Number(rating))
      : professionalsWithRatings;

    const total = await prisma.creativeProfile.count({ where });

    res.json({
      success: true,
      professionals: filteredProfessionals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async searchEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      q,
      eventType,
      location,
      dateFrom,
      dateTo,
      minBudget,
      maxBudget,
      requiredRoles,
      page = 1,
      limit = 20,
      sortBy = 'startDate',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      status: 'PUBLISHED',
      startDate: { gte: new Date() },
    };

    if (q) {
      where.OR = [
        { title: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { location: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    if (dateFrom) {
      where.startDate = { ...where.startDate, gte: new Date(dateFrom as string) };
    }

    if (dateTo) {
      where.endDate = { lte: new Date(dateTo as string) };
    }

    if (minBudget) {
      where.budget = { gte: Number(minBudget) };
    }

    if (maxBudget) {
      where.budget = { ...where.budget, lte: Number(maxBudget) };
    }

    if (requiredRoles && Array.isArray(requiredRoles)) {
      where.requiredRoles = { hasSome: requiredRoles };
    }

    const orderBy: any = {};
    if (sortBy === 'startDate') {
      orderBy.startDate = sortOrder;
    } else if (sortBy === 'budget') {
      orderBy.budget = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
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

  async getSuggestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { q, type, limit = 10 } = req.query;

    let suggestions: string[] = [];

    switch (type) {
      case 'skills':
        const skillsData = await prisma.creativeProfile.findMany({
          where: {
            skills: { hasSome: [q as string] },
          },
          select: { skills: true },
          take: Number(limit),
        });
        suggestions = [...new Set(skillsData.flatMap(p => p.skills))];
        break;

      case 'locations':
        const locationsData = await prisma.user.findMany({
          where: {
            location: { contains: q as string, mode: 'insensitive' },
            isActive: true,
          },
          select: { location: true },
          take: Number(limit),
        });
        suggestions = [...new Set(locationsData.map(u => u.location).filter(Boolean))];
        break;

      case 'professionals':
        const professionalsData = await prisma.user.findMany({
          where: {
            name: { contains: q as string, mode: 'insensitive' },
            role: 'CREATIVE_PROFESSIONAL',
            isActive: true,
          },
          select: { name: true },
          take: Number(limit),
        });
        suggestions = professionalsData.map(p => p.name);
        break;

      case 'events':
        const eventsData = await prisma.event.findMany({
          where: {
            title: { contains: q as string, mode: 'insensitive' },
            status: 'PUBLISHED',
          },
          select: { title: true },
          take: Number(limit),
        });
        suggestions = eventsData.map(e => e.title);
        break;
    }

    res.json({
      success: true,
      suggestions: suggestions.slice(0, Number(limit)),
    });
  }
}
