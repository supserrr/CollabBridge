import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

interface AdvancedSearchFilters {
  q?: string;
  location?: string;
  radius?: number;
  categories?: string[];
  skills?: string[];
  min_rate?: number;
  max_rate?: number;
  start_date?: string;
  end_date?: string;
  min_rating?: number;
  max_response_time?: number;
  verified?: boolean;
  languages?: string[];
  experience?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class EnhancedSearchController {
  async searchProfessionals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = this.parseSearchFilters(req.query as any);
      
      // Build the where clause dynamically
      const where: any = {
        users: { 
          isActive: true,
          isPublic: true
        },
      };

      // Text search across multiple fields
      if (filters.q) {
        where.OR = [
          {
            users: {
              OR: [
                { name: { contains: filters.q, mode: 'insensitive' } },
                { displayName: { contains: filters.q, mode: 'insensitive' } },
                { bio: { contains: filters.q, mode: 'insensitive' } }
              ]
            }
          },
          { skills: { hasSome: [filters.q.toLowerCase()] } },
          { categories: { hasSome: [filters.q] } },
          { experience: { contains: filters.q, mode: 'insensitive' } }
        ];
      }

      // Location-based filtering
      if (filters.location) {
        where.users.location = { 
          contains: filters.location, 
          mode: 'insensitive' 
        };
      }

      // Category filtering
      if (filters.categories && filters.categories.length > 0) {
        where.categories = { hassome: filters.categories };
      }

      // Skills filtering
      if (filters.skills && filters.skills.length > 0) {
        where.skills = { hasSome: filters.skills };
      }

      // Rate range filtering
      if (filters.min_rate || filters.max_rate) {
        const rateFilter: any = {};
        if (filters.min_rate) rateFilter.gte = filters.min_rate;
        if (filters.max_rate) rateFilter.lte = filters.max_rate;
        
        where.OR = [
          { hourlyRate: rateFilter },
          { dailyRate: rateFilter }
        ];
      }

      // Availability filtering
      if (filters.start_date && filters.end_date) {
        where.AND = [
          { availableFrom: { lte: new Date(filters.start_date) } },
          { availableTo: { gte: new Date(filters.end_date) } }
        ];
      }

      // Response time filtering
      if (filters.max_response_time) {
        where.responseTime = { lte: filters.max_response_time };
      }

      // Verification filtering
      if (filters.verified) {
        where.users.isVerified = true;
      }

      // Languages filtering
      if (filters.languages && filters.languages.length > 0) {
        where.languages = { hasSome: filters.languages };
      }

      // Experience level filtering
      if (filters.experience) {
        where.experience = { contains: filters.experience, mode: 'insensitive' };
      }

      // Build order by clause
      const orderBy = this.buildOrderBy(filters.sort || 'relevance');

      const skip = ((filters.page || 1) - 1) * (filters.limit || 12);

      // Execute search with aggregated rating calculation
      const [professionals, total] = await Promise.all([
        prisma.creative_profiles.findMany({
          where,
          skip,
          take: filters.limit || 12,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                displayName: true,
                avatar: true,
                location: true,
                bio: true,
                isVerified: true,
                createdAt: true,
              },
            },
            reviews: {
              select: {
                rating: true,
                communication: true,
                professionalism: true,
                quality: true,
              },
            },
            _count: {
              select: {
                reviews: true,
                bookings: true,
              },
            },
          },
          orderBy,
        }),
        prisma.creative_profiles.count({ where }),
      ]);

      // Calculate ratings and format results
      const formattedResults = professionals.map(prof => {
        const reviews = prof.reviews;
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

        const avgCommunication = reviews.length > 0 && reviews.some(r => r.communication)
          ? reviews.filter(r => r.communication).reduce((sum, review) => sum + review.communication!, 0) / 
            reviews.filter(r => r.communication).length
          : 0;

        const avgProfessionalism = reviews.length > 0 && reviews.some(r => r.professionalism)
          ? reviews.filter(r => r.professionalism).reduce((sum, review) => sum + review.professionalism!, 0) / 
            reviews.filter(r => r.professionalism).length
          : 0;

        const avgQuality = reviews.length > 0 && reviews.some(r => r.quality)
          ? reviews.filter(r => r.quality).reduce((sum, review) => sum + review.quality!, 0) / 
            reviews.filter(r => r.quality).length
          : 0;

        // Calculate distance if location provided (simplified - in production, use proper geo calculations)
        let distance;
        if (filters.location && prof.users.location) {
          // Placeholder distance calculation - implement proper geospatial calculations
          distance = Math.random() * (filters.radius || 25);
        }

        return {
          id: prof.id,
          userId: prof.users.id,
          name: prof.users.name,
          displayName: prof.users.displayName,
          avatar: prof.users.avatar,
          location: prof.users.location,
          bio: prof.users.bio,
          distance,
          categories: prof.categories,
          skills: prof.skills,
          hourlyRate: prof.hourlyRate,
          dailyRate: prof.dailyRate,
          experience: prof.experience,
          equipment: prof.equipment,
          languages: prof.languages,
          portfolioImages: prof.portfolioImages,
          portfolioLinks: prof.portfolioLinks,
          isAvailable: prof.isAvailable,
          responseTime: prof.responseTime,
          travelRadius: prof.travelRadius,
          isVerified: prof.users.isVerified,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: prof._count.reviews,
          bookingCount: prof._count.bookings,
          ratings: {
            overall: Math.round(avgRating * 10) / 10,
            communication: Math.round(avgCommunication * 10) / 10,
            professionalism: Math.round(avgProfessionalism * 10) / 10,
            quality: Math.round(avgQuality * 10) / 10,
          },
          memberSince: prof.users.createdAt,
          certifications: prof.certifications,
          awards: prof.awards,
          socialMedia: prof.socialMedia,
        };
      });

      res.json({
        success: true,
        data: {
          professionals: formattedResults,
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 12,
            total,
            pages: Math.ceil(total / (filters.limit || 12)),
          },
          filters: {
            applied: this.getAppliedFilters(filters),
            available: {
              categories: await this.getAvailableCategories(),
              skills: await this.getAvailableSkills(),
              languages: await this.getAvailableLanguages(),
              experienceLevels: ['Entry Level', 'Intermediate', 'Expert', 'Master'],
              priceRange: await this.getPriceRange(),
            }
          }
        },
      });

    } catch (error) {
      logger.error('Enhanced search error:', error);
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }

  private parseSearchFilters(query: any): AdvancedSearchFilters {
    return {
      q: query.q,
      location: query.location,
      radius: query.radius ? parseInt(query.radius) : undefined,
      categories: query.categories ? query.categories.split(',').filter(Boolean) : undefined,
      skills: query.skills ? query.skills.split(',').filter(Boolean) : undefined,
      min_rate: query.min_rate ? parseFloat(query.min_rate) : undefined,
      max_rate: query.max_rate ? parseFloat(query.max_rate) : undefined,
      start_date: query.start_date,
      end_date: query.end_date,
      min_rating: query.min_rating ? parseFloat(query.min_rating) : undefined,
      max_response_time: query.max_response_time ? parseInt(query.max_response_time) : undefined,
      verified: query.verified === 'true',
      languages: query.languages ? query.languages.split(',').filter(Boolean) : undefined,
      experience: query.experience,
      sort: query.sort,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 12,
    };
  }

  private buildOrderBy(sort: string): any {
    switch (sort) {
      case 'rating':
        // Note: This is simplified. For true rating sorting, you'd need to use raw SQL or aggregations
        return [{ reviews: { _count: 'desc' } }];
      case 'price_low':
        return [{ hourlyRate: 'asc' }];
      case 'price_high':
        return [{ hourlyRate: 'desc' }];
      case 'response_time':
        return [{ responseTime: 'asc' }];
      case 'newest':
        return [{ users: { createdAt: 'desc' } }];
      case 'distance':
        // For distance sorting, you'd implement geospatial queries
        return [{ createdAt: 'desc' }];
      case 'relevance':
      default:
        return [
          { isAvailable: 'desc' },
          { responseTime: 'asc' },
          { reviews: { _count: 'desc' } },
          { createdAt: 'desc' }
        ];
    }
  }

  private getAppliedFilters(filters: AdvancedSearchFilters) {
    const applied = [];
    if (filters.q) applied.push({ type: 'search', value: filters.q });
    if (filters.location) applied.push({ type: 'location', value: filters.location });
    if (filters.categories?.length) applied.push({ type: 'categories', value: filters.categories });
    if (filters.skills?.length) applied.push({ type: 'skills', value: filters.skills });
    if (filters.min_rate || filters.max_rate) {
      applied.push({ 
        type: 'price_range', 
        value: `$${filters.min_rate || 0} - $${filters.max_rate || '∞'}` 
      });
    }
    if (filters.min_rating) applied.push({ type: 'rating', value: `${filters.min_rating}+ stars` });
    if (filters.verified) applied.push({ type: 'verification', value: 'Verified only' });
    if (filters.languages?.length) applied.push({ type: 'languages', value: filters.languages });
    if (filters.experience) applied.push({ type: 'experience', value: filters.experience });
    return applied;
  }

  private async getAvailableCategories(): Promise<string[]> {
    const result = await prisma.creative_profiles.findMany({
      select: { categories: true },
      where: { users: { isActive: true } }
    });
    
    const categories = new Set<string>();
    result.forEach(prof => prof.categories.forEach(cat => categories.add(cat)));
    return Array.from(categories).sort();
  }

  private async getAvailableSkills(): Promise<string[]> {
    const result = await prisma.creative_profiles.findMany({
      select: { skills: true },
      where: { users: { isActive: true } }
    });
    
    const skills = new Set<string>();
    result.forEach(prof => prof.skills.forEach(skill => skills.add(skill)));
    return Array.from(skills).sort();
  }

  private async getAvailableLanguages(): Promise<string[]> {
    const result = await prisma.creative_profiles.findMany({
      select: { languages: true },
      where: { users: { isActive: true } }
    });
    
    const languages = new Set<string>();
    result.forEach(prof => prof.languages.forEach(lang => languages.add(lang)));
    return Array.from(languages).sort();
  }

  private async getPriceRange(): Promise<{ min: number; max: number }> {
    const result = await prisma.creative_profiles.aggregate({
      _min: { hourlyRate: true },
      _max: { hourlyRate: true },
      where: { 
        users: { isActive: true },
        hourlyRate: { not: null }
      }
    });

    return {
      min: result._min.hourlyRate || 25,
      max: result._max.hourlyRate || 1000
    };
  }
}
