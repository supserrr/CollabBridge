import { Response } from 'express';
import { Request } from 'express';
import { prisma } from '../../config/database';

export class SearchController {
  async searchProfessionals(req: Request, res: Response): Promise<void> {
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
        user: { isActive: true },
      };

      if (categories) {
        const categoryArray = (categories as string).split(',');
        where.categories = { hasSome: categoryArray };
      }

      if (location) {
        where.user = {
          ...where.user,
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
            user: {
              name: { contains: search as string, mode: 'insensitive' },
            },
          },
          {
            skills: { hasSome: [(search as string).toLowerCase()] },
          },
        ];
      }

      const [professionals, total] = await Promise.all([
        prisma.creativeProfile.findMany({
          where,
          skip,
          take: Number(limit),
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
                bookings: true,
                receivedReviews: true,
              },
            },
          },
        }),
        prisma.creativeProfile.count({ where }),
      ]);

      // Calculate average ratings
      const professionalsWithRatings = professionals.map(prof => {
        const ratings = prof.receivedReviews.map(r => r.rating);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;
        
        return {
          ...prof,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: prof._count.receivedReviews,
          bookingCount: prof._count.bookings,
        };
      });

      // Filter by minimum rating if specified
      const filteredProfessionals = minRating 
        ? professionalsWithRatings.filter(p => p.averageRating >= Number(minRating))
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

  async searchEvents(req: Request, res: Response): Promise<void> {
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
        prisma.event.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: [
            { isFeatured: 'desc' },
            { startDate: 'asc' },
          ],
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
}
