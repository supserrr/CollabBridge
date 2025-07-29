import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { searchService } from '../../services/SearchService';
import { createError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { prisma } from '../../config/database';

export class SearchController {
  async searchProfessionals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 12,
        categories,
        location,
        minRating,
        maxRate,
        availability,
        skills,
        search,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {
        users: { isActive: true },
      };

      if (categories) {
        const categoryArray = (categories as string).split(',');
        where.categories = { hasSome: categoryArray };
      }

      if (location) {
        where.users = {
          ...where.users,
          location: { contains: location as string, mode: 'insensitive' },
        };
      }

      if (availability !== undefined) {
        where.isAvailable = availability === 'true';
      }

      if (skills) {
        const skillArray = (skills as string).split(',');
        where.skills = { hasSome: skillArray };
      }

      if (maxRate) {
        where.OR = [
          { hourlyRate: { lte: Number(maxRate) } },
          { dailyRate: { lte: Number(maxRate) } },
        ];
      }

      if (search) {
        where.OR = [
          {
            users: {
              name: { contains: search as string, mode: 'insensitive' },
            },
          },
          {
            skills: { hasSome: [(search as string).toLowerCase()] },
          },
        ];
      }

      const [professionals, total] = await Promise.all([
        prisma.creative_profiles.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            users: {
              select: {
                id: true,
                name: true,
                displayName: true,
                avatar: true,
                location: true,
                bio: true,
                username: true,
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
            _count: {
              select: {
                bookings: true,
                reviews: true,
              },
            },
          },
        }),
        prisma.creative_profiles.count({ where }),
      ]);

      // Transform data to meaningful platform information
      const professionalsWithRatings = professionals.map(prof => {
        const ratings = prof.reviews.map(r => r.rating);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;
        
        // Calculate response time based on responseTime field (in hours)
        const responseTime = prof.responseTime 
          ? `${prof.responseTime}h` 
          : 'Usually responds within 24h';
        
        // Format hourly rate
        const hourlyRate = prof.hourlyRate 
          ? `$${prof.hourlyRate}/hr` 
          : prof.dailyRate 
            ? `$${prof.dailyRate}/day` 
            : 'Rate on request';
        
        // Primary category for title display
        const primaryCategory = prof.categories.length > 0 
          ? prof.categories[0] 
          : 'Creative Professional';
        
        return {
          id: prof.userId,
          name: prof.users.displayName || prof.users.name,
          username: prof.users.username,
          title: primaryCategory,
          location: prof.users.location || 'Location not specified',
          rating: Math.round(averageRating * 10) / 10,
          reviews: prof._count.reviews,
          hourlyRate: hourlyRate,
          skills: prof.skills.slice(0, 5), // Show max 5 skills
          categories: prof.categories,
          avatar: prof.users.avatar,
          verified: false, // TODO: Implement verification system
          responseTime: responseTime,
          completedProjects: prof._count.bookings,
          description: prof.users.bio || prof.experience || 'No description available',
          availability: prof.isAvailable ? 'Available' : 'Busy',
          portfolioImages: prof.portfolioImages,
          portfolioLinks: prof.portfolioLinks,
          languages: prof.languages,
          certifications: prof.certifications,
          awards: prof.awards,
          equipment: prof.equipment,
          experience: prof.experience,
          travelRadius: prof.travelRadius,
        };
      });

      // Filter by minimum rating if specified
      const filteredProfessionals = minRating 
        ? professionalsWithRatings.filter(p => p.rating >= Number(minRating))
        : professionalsWithRatings;

      res.json({
        success: true,
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

  async searchEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 12,
        eventType,
        location,
        dateFrom,
        dateTo,
        budgetMin,
        budgetMax,
        requiredRoles,
        search,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {
        status: 'PUBLISHED',
        isPublic: true,
        startDate: { gte: new Date() },
      };

      if (eventType) where.eventType = eventType;
      if (location) where.location = { contains: location as string, mode: 'insensitive' };
      
      if (budgetMin || budgetMax) {
        where.budget = {};
        if (budgetMin) where.budget.gte = Number(budgetMin);
        if (budgetMax) where.budget.lte = Number(budgetMax);
      }

      if (dateFrom) where.startDate.gte = new Date(dateFrom as string);
      if (dateTo) where.startDate.lte = new Date(dateTo as string);

      if (requiredRoles) {
        const roles = (requiredRoles as string).split(',');
        where.requiredRoles = { hasSome: roles };
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [events, total] = await Promise.all([
        prisma.events.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: [
            { isFeatured: 'desc' },
            { startDate: 'asc' },
          ],
          include: {
            event_planners: {
              include: {
                users: {
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
                event_applications: true,
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
}
