"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
class SearchController {
    async searchProfessionals(req, res) {
        try {
            const { query = '', categories, location, minRating = 0, maxRate, isAvailable, page = 1, limit = 12, sortBy = 'relevance', } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            let where = {
                users: {
                    isActive: true,
                    role: 'CREATIVE_PROFESSIONAL',
                },
            };
            // Text search
            if (query) {
                where.OR = [
                    { users: { name: { contains: query, mode: 'insensitive' } } },
                    { users: { bio: { contains: query, mode: 'insensitive' } } },
                    { experience: { contains: query, mode: 'insensitive' } },
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
                    contains: location,
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
            let orderBy = {};
            switch (sortBy) {
                case 'rate_low':
                    orderBy = { hourlyRate: 'asc' };
                    break;
                case 'rate_high':
                    orderBy = { hourlyRate: 'desc' };
                    break;
                case 'newest':
                    orderBy = { users: { createdAt: 'desc' } };
                    break;
                default:
                    orderBy = { users: { createdAt: 'desc' } };
            }
            const [professionals, total] = await Promise.all([
                database_1.prisma.creative_profiles.findMany({
                    where,
                    include: {
                        users: {
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
                database_1.prisma.creative_profiles.count({ where }),
            ]);
            // Get ratings for each professional
            const professionalsWithRatings = await Promise.all(professionals.map(async (professional) => {
                const ratings = await database_1.prisma.reviews.aggregate({
                    where: {
                        revieweeId: professional.userId,
                        isPublic: true
                    },
                    _avg: {
                        rating: true,
                        communication: true,
                        professionalism: true,
                        quality: true
                    },
                    _count: {
                        _all: true
                    }
                });
                const avgRating = ratings._avg?.rating ?? 0;
                const totalReviews = ratings._count?._all ?? 0;
                // Apply rating filter if specified
                if (Number(minRating) > 0 && avgRating < Number(minRating)) {
                    return null;
                }
                return {
                    ...professional,
                    averageRating: avgRating,
                    totalReviews,
                    completedProjects: professional._count.bookings,
                };
            }));
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
        }
        catch (error) {
            throw error;
        }
    }
    async searchEvents(req, res) {
        try {
            const { query = '', eventType, location, dateFrom, dateTo, budgetMin, budgetMax, requiredRoles, page = 1, limit = 12, } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            let where = {
                isPublic: true,
                status: 'ACTIVE',
                date: {
                    gte: new Date(),
                },
            };
            // Text search
            if (query) {
                where.OR = [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { location: { contains: query, mode: 'insensitive' } },
                ];
            }
            // Filter by event type
            if (eventType) {
                where.eventType = eventType;
            }
            // Filter by location
            if (location) {
                where.location = {
                    contains: location,
                    mode: 'insensitive',
                };
            }
            // Filter by date range
            if (dateFrom) {
                where.date.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.date.lte = new Date(dateTo);
            }
            // Filter by budget range
            if (budgetMin || budgetMax) {
                where.budget = {};
                if (budgetMin)
                    where.budget.gte = Number(budgetMin);
                if (budgetMax)
                    where.budget.lte = Number(budgetMax);
            }
            // Filter by required roles
            if (requiredRoles) {
                const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
                where.requiredRoles = {
                    hasSome: rolesArray,
                };
            }
            const [events, total] = await Promise.all([
                database_1.prisma.events.findMany({
                    where: {
                        status: 'PUBLISHED',
                        ...where
                    },
                    include: {
                        event_planners: {
                            include: {
                                users: true
                            }
                        },
                        event_applications: true,
                        bookings: true
                    },
                    orderBy: {
                        startDate: 'desc'
                    },
                    skip,
                    take: Number(limit),
                }),
                database_1.prisma.events.count({ where }),
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
        }
        catch (error) {
            throw error;
        }
    }
    async getCategories(req, res) {
        try {
            // Get unique categories from creative profiles
            const result = await database_1.prisma.$queryRaw `
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
        }
        catch (error) {
            throw error;
        }
    }
    async getEventTypes(req, res) {
        try {
            const eventTypes = await database_1.prisma.events.groupBy({
                by: ['eventType'],
                where: {
                    isPublic: true,
                    status: client_1.EventStatus.PUBLISHED,
                },
                _count: {
                    eventType: true,
                }
            });
            res.json(eventTypes);
        }
        catch (error) {
            throw error;
        }
    }
    async getAverageRating(req, res) {
        try {
            const { userId } = req.params;
            const ratings = await database_1.prisma.reviews.aggregate({
                where: {
                    revieweeId: userId
                },
                _avg: {
                    rating: true
                },
                _count: true
            });
            const totalReviews = ratings._count;
            const averageRating = ratings._avg.rating ?? 0;
            res.json({
                averageRating,
                totalReviews
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.SearchController = SearchController;
//# sourceMappingURL=SearchController.js.map