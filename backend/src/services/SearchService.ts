import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { cacheService, CacheService } from './CacheService';

export interface ProfessionalSearchFilters {
  categories?: string[];
  location?: string;
  minRating?: number;
  maxRate?: number;
  availability?: boolean;
  skills?: string[];
  search?: string;
  sortBy?: 'rate_low' | 'rate_high' | 'rating' | 'newest' | 'relevance';
  radius?: number; // Search radius in kilometers
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface EventSearchFilters {
  eventType?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
  requiredRoles?: string[];
  search?: string;
  featured?: boolean;
  sortBy?: 'date' | 'budget' | 'relevance' | 'newest';
}

export interface SearchSuggestion {
  type: 'professional' | 'event' | 'skill' | 'location';
  text: string;
  count?: number;
}

export class SearchService {
  
  // Full-text search for professionals using PostgreSQL
  async searchProfessionals(filters: ProfessionalSearchFilters, pagination: PaginationOptions) {
    try {
      const { page = 1, limit = 12 } = pagination;
      const skip = (page - 1) * limit;

      // Create cache key
      const cacheKey = CacheService.KEYS.SEARCH_RESULTS(
        JSON.stringify(filters), 
        `page:${page}:limit:${limit}`
      );

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Build dynamic where clause
      let where: any = {
        users: { 
          isActive: true, 
          role: 'CREATIVE_PROFESSIONAL' 
        },
      };

      // Full-text search implementation
      if (filters.search) {
        const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
        
        if (searchTerms.length > 0) {
          // Create tsquery for full-text search
          const tsQuery = searchTerms
            .map(term => `${term}:*`)
            .join(' & ');

          // Use PostgreSQL full-text search
          where = {
            ...where,
            OR: [
              // Search in user name and bio
              {
                users: {
                  OR: [
                    {
                      name: {
                        search: tsQuery,
                        mode: 'insensitive'
                      }
                    },
                    {
                      bio: {
                        search: tsQuery,
                        mode: 'insensitive'
                      }
                    }
                  ]
                }
              },
              // Search in professional skills and categories
              {
                OR: [
                  { skills: { hasSome: searchTerms } },
                  { categories: { hasSome: searchTerms } },
                  { 
                    skills: {
                      some: {
                        in: searchTerms.map(term => 
                          typeof term === 'string' ? term.toLowerCase() : term
                        )
                      }
                    }
                  }
                ]
              }
            ]
          };
        }
      }

      if (filters.categories?.length) {
        where.categories = { hasSome: filters.categories };
      }

      if (filters.location) {
        where.user = {
          ...where.user,
          location: { contains: filters.location, mode: 'insensitive' }
        };
      }

      if (filters.maxRate) {
        where.OR = [
          { hourlyRate: { lte: filters.maxRate } },
          { dailyRate: { lte: filters.maxRate } }
        ];
      }

      if (filters.minRating && filters.minRating > 0) {
        where.averageRating = { gte: filters.minRating };
      }

      if (filters.availability !== undefined) {
        where.isAvailable = filters.availability;
      }

      if (filters.skills?.length) {
        where.skills = { hasSome: filters.skills };
      }

      // Enhanced sorting options
      let orderBy: any = { createdAt: 'desc' }; // default
      
      switch (filters.sortBy) {
        case 'rate_low':
          orderBy = [
            { hourlyRate: { sort: 'asc', nulls: 'last' } },
            { dailyRate: { sort: 'asc', nulls: 'last' } }
          ];
          break;
        case 'rate_high':
          orderBy = [
            { hourlyRate: { sort: 'desc', nulls: 'last' } },
            { dailyRate: { sort: 'desc', nulls: 'last' } }
          ];
          break;
        case 'rating':
          orderBy = [
            { averageRating: 'desc' },
            { totalReviews: 'desc' }
          ];
          break;
        case 'relevance':
          // For full-text search relevance, we'll use a raw query
          if (filters.search) {
            orderBy = { _relevance: { fields: ['skills', 'categories'], search: filters.search, sort: 'desc' } };
          }
          break;
        case 'newest':
        default:
          orderBy = { createdAt: 'desc' };
      }

      if (filters.search) {
        where.OR = [
          { users: { name: { contains: filters.search, mode: 'insensitive' } } },
          { users: { bio: { contains: filters.search, mode: 'insensitive' } } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Execute search with ratings
      const [professionals, total] = await Promise.all([
        prisma.creative_profiles.findMany({
          where,
          skip,
          take: limit,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                avatar: true,
                location: true,
                bio: true,
                createdAt: true,
              }
            },
            _count: {
              select: {
                bookings: { where: { status: 'COMPLETED' } },
                reviews: { where: { isPublic: true } }
              }
            }
          },
          orderBy: this.buildOrderBy(filters.sortBy)
        }),
        prisma.creative_profiles.count({ where })
      ]);

      // Calculate ratings and apply rating filter
      const professionalsWithRatings = await Promise.all(
        professionals.map(async (prof) => {
          const avgRating = await this.calculateAverageRating(prof.userId);
          
          return {
            ...prof,
            averageRating: avgRating,
            completedProjects: prof._count.bookings,
            totalReviews: prof._count.reviews,
          };
        })
      );

      // Apply rating filter post-query (since it requires aggregation)
      const filteredProfessionals = filters.minRating 
        ? professionalsWithRatings.filter(p => p.averageRating >= filters.minRating!)
        : professionalsWithRatings;

      return {
        professionals: filteredProfessionals,
        pagination: {
          page,
          limit,
          total: filteredProfessionals.length,
          pages: Math.ceil(filteredProfessionals.length / limit),
          hasNext: page < Math.ceil(filteredProfessionals.length / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Search professionals error:', error);
      throw createError('Search failed', 500);
    }
  }

  async searchEvents(filters: EventSearchFilters, pagination: PaginationOptions) {
    try {
      const { page = 1, limit = 12 } = pagination;
      const skip = (page - 1) * limit;

      const where: any = {
        isPublic: true,
        status: 'PUBLISHED',
      };

      if (filters.eventType) {
        where.eventType = filters.eventType;
      }

      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }

      if (filters.dateFrom || filters.dateTo) {
        where.startDate = {};
        if (filters.dateFrom) {
          where.startDate.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          where.startDate.lte = new Date(filters.dateTo);
        }
      }

      if (filters.budgetMin || filters.budgetMax) {
        where.budget = {};
        if (filters.budgetMin) {
          where.budget.gte = filters.budgetMin;
        }
        if (filters.budgetMax) {
          where.budget.lte = filters.budgetMax;
        }
      }

      if (filters.requiredRoles?.length) {
        where.requiredRoles = { hasSome: filters.requiredRoles };
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { location: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [events, total] = await Promise.all([
        prisma.events.findMany({
          where,
          skip,
          take: limit,
          include: {
            event_planners: {
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  }
                }
              }
            },
            _count: {
              select: {
                event_applications: true,
                bookings: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.events.count({ where })
      ]);

      return {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Search events error:', error);
      throw createError('Search failed', 500);
    }
  }

  private async calculateAverageRating(userId: string): Promise<number> {
    try {
      const result = await prisma.reviews.aggregate({
        where: { revieweeId: userId, isPublic: true },
        _avg: { rating: true },
      });

      return result._avg.rating || 0;
    } catch (error) {
      logger.error('Calculate rating error:', error);
      return 0;
    }
  }

  private buildOrderBy(sortBy?: string): any {
    switch (sortBy) {
      case 'rate_low':
        return { hourlyRate: 'asc' };
      case 'rate_high':
        return { hourlyRate: 'desc' };
      case 'newest':
        return { users: { createdAt: 'desc' } };
      default:
        return { users: { createdAt: 'desc' } };
    }
  }

  async getPopularCategories(limit: number = 10) {
    try {
      const categories = await prisma.creative_profiles.groupBy({
        by: ['categories'],
        where: {
          users: { isActive: true }
        },
        _count: {
          categories: true
        },
        orderBy: {
          _count: {
            categories: 'desc'
          }
        },
        take: limit
      });

      return categories;
    } catch (error) {
      logger.error('Get popular categories error:', error);
      throw createError('Failed to get categories', 500);
    }
  }

  // Search suggestions and autocomplete
  async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      if (!query || query.length < 2) return [];

      const cacheKey = `search:suggestions:${query.toLowerCase()}:${limit}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const suggestions: SearchSuggestion[] = [];
      const searchTerm = query.toLowerCase();

      // Get professional names and skills
      const professionals = await prisma.creative_profiles.findMany({
        where: {
          OR: [
            { skills: { hasSome: [searchTerm] } },
            { categories: { hasSome: [searchTerm] } },
            { users: { name: { contains: searchTerm, mode: 'insensitive' } } }
          ]
        },
        include: { users: { select: { name: true } } },
        take: limit
      });

      professionals.forEach(prof => {
        if (prof.users.name.toLowerCase().includes(searchTerm)) {
          suggestions.push({
            type: 'professional',
            text: prof.users.name
          });
        }
        
        prof.skills.forEach(skill => {
          if (skill.toLowerCase().includes(searchTerm)) {
            suggestions.push({
              type: 'skill',
              text: skill
            });
          }
        });
      });

      // Get popular locations
      const locations = await prisma.users.groupBy({
        by: ['location'],
        where: {
          location: { contains: searchTerm, mode: 'insensitive' },
          isActive: true
        },
        _count: { location: true },
        orderBy: { _count: { location: 'desc' } },
        take: 3
      });

      locations.forEach(loc => {
        if (loc.location) {
          suggestions.push({
            type: 'location',
            text: loc.location,
            count: loc._count.location
          });
        }
      });

      // Get event titles
      const events = await prisma.events.findMany({
        where: {
          title: { contains: searchTerm, mode: 'insensitive' },
          status: 'PUBLISHED'
        },
        select: { title: true },
        take: 3
      });

      events.forEach(event => {
        suggestions.push({
          type: 'event',
          text: event.title
        });
      });

      // Remove duplicates and limit
      const uniqueSuggestions = Array.from(
        new Map(suggestions.map(s => [`${s.type}:${s.text}`, s])).values()
      ).slice(0, limit);

      await cacheService.set(cacheKey, uniqueSuggestions, CacheService.TTL.SEARCH_RESULTS);
      return uniqueSuggestions;

    } catch (error) {
      logger.error('Get search suggestions error:', error);
      return [];
    }
  }

  // Advanced search with faceted filters
  async getSearchFacets(filters: ProfessionalSearchFilters) {
    try {
      const cacheKey = `search:facets:${JSON.stringify(filters)}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      // Get available categories with counts
      const categories = await prisma.creative_profiles.groupBy({
        by: ['categories'],
        _count: { categories: true },
        where: {
          users: { isActive: true, role: 'CREATIVE_PROFESSIONAL' }
        },
        orderBy: { _count: { categories: 'desc' } }
      });

      // Get skill distribution
      const skills = await prisma.creative_profiles.groupBy({
        by: ['skills'],
        _count: { skills: true },
        where: {
          users: { isActive: true, role: 'CREATIVE_PROFESSIONAL' }
        },
        orderBy: { _count: { skills: 'desc' } },
        take: 20
      });

      // Get location distribution
      const locations = await prisma.users.groupBy({
        by: ['location'],
        _count: { location: true },
        where: {
          isActive: true,
          role: 'CREATIVE_PROFESSIONAL',
          location: { not: null }
        },
        orderBy: { _count: { location: 'desc' } },
        take: 15
      });

      // Get rate ranges
      const rateStats = await prisma.creative_profiles.aggregate({
        _min: { hourlyRate: true, dailyRate: true },
        _max: { hourlyRate: true, dailyRate: true },
        _avg: { hourlyRate: true, dailyRate: true },
        where: {
          users: { isActive: true, role: 'CREATIVE_PROFESSIONAL' },
          OR: [
            { hourlyRate: { not: null } },
            { dailyRate: { not: null } }
          ]
        }
      });

      const facets = {
        categories: categories.flatMap(c => c.categories).reduce((acc: any, cat) => {
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}),
        skills: skills.flatMap(s => s.skills).reduce((acc: any, skill) => {
          acc[skill] = (acc[skill] || 0) + 1;
          return acc;
        }, {}),
        locations: locations.filter(l => l.location).map(l => ({
          name: l.location,
          count: l._count.location
        })),
        rateRanges: {
          hourly: {
            min: rateStats._min.hourlyRate || 0,
            max: rateStats._max.hourlyRate || 0,
            avg: rateStats._avg.hourlyRate || 0
          },
          daily: {
            min: rateStats._min.dailyRate || 0,
            max: rateStats._max.dailyRate || 0,
            avg: rateStats._avg.dailyRate || 0
          }
        }
      };

      await cacheService.set(cacheKey, facets, CacheService.TTL.STATISTICS);
      return facets;

    } catch (error) {
      logger.error('Get search facets error:', error);
      throw createError('Failed to get search facets', 500);
    }
  }

  // Trending searches and popular content
  async getTrendingSearches(limit: number = 10) {
    try {
      const cacheKey = `trending:searches:${limit}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      // In a real implementation, you'd track search queries in a separate table
      // For now, return popular skills and categories
      const popularSkills = await prisma.creative_profiles.groupBy({
        by: ['skills'],
        _count: { skills: true },
        orderBy: { _count: { skills: 'desc' } },
        take: limit
      });

      const trending = popularSkills
        .flatMap(s => s.skills)
        .slice(0, limit)
        .map(skill => ({ term: skill, type: 'skill' }));

      await cacheService.set(cacheKey, trending, CacheService.TTL.POPULAR_CONTENT);
      return trending;

    } catch (error) {
      logger.error('Get trending searches error:', error);
      return [];
    }
  }

  async getSuggestedProfessionals(userId: string, limit: number = 5) {
    try {
      // Get user's event types and locations for suggestions
      const userEvents = await prisma.events.findMany({
        where: {
          event_planners: {
            userId: userId
          }
        },
        select: {
          eventType: true,
          location: true,
          requiredRoles: true
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });

      const eventTypes = Array.from(new Set(userEvents.map(e => e.eventType)));
      const locations = Array.from(new Set(userEvents.map(e => e.location)));
      const requiredRoles = Array.from(new Set(userEvents.flatMap(e => e.requiredRoles)));

      const professionals = await prisma.creative_profiles.findMany({
        where: {
          users: { isActive: true },
          OR: [
            { categories: { hasSome: requiredRoles } },
            { users: { location: { in: locations } } }
          ]
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              avatar: true,
              location: true,
              bio: true
            }
          },
          _count: {
            select: {
              bookings: { where: { status: 'COMPLETED' } },
              reviews: { where: { isPublic: true } }
            }
          }
        },
        take: limit,
        orderBy: [
          { users: { createdAt: 'desc' } }
        ]
      });

      return professionals;
    } catch (error) {
      logger.error('Get suggested professionals error:', error);
      throw createError('Failed to get suggestions', 500);
    }
  }
}

export const searchService = new SearchService();
