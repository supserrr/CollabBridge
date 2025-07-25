"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const CacheService_1 = require("../services/CacheService");
const router = express_1.default.Router();
/**
 * Check username availability
 * GET /check/:username
 */
router.get('/check/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // Validate username format
        if (!username || typeof username !== 'string') {
            res.status(400).json({
                error: 'Invalid username format'
            });
            return;
        }
        // usersname validation rules
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(username)) {
            res.status(400).json({
                error: 'Invalid username format',
                message: 'usersname must be 3-20 characters and contain only letters, numbers, hyphens, and underscores'
            });
            return;
        }
        // Normalize username (lowercase)
        const normalizedusersname = username.toLowerCase();
        // Check if username exists in database
        const existingusers = await database_1.prisma.users.findUnique({
            where: {
                username: username.toLowerCase()
            }
        });
        const isAvailable = !existingusers;
        res.json({
            username: normalizedusersname,
            available: isAvailable,
            message: isAvailable
                ? 'usersname is available'
                : 'usersname is already taken'
        });
    }
    catch (error) {
        logger_1.logger.error('Error checking username availability:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to check username availability'
        });
    }
});
/**
 * Get public profile by username
 * GET /:username
 */
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // Validate username format
        if (!username || typeof username !== 'string') {
            res.status(400).json({
                error: 'Invalid username format'
            });
            return;
        }
        // Normalize username (lowercase, trim)
        const normalizedusersname = username.toLowerCase().trim();
        // Check cache first
        const cacheKey = CacheService_1.CacheService.KEYS.USER_PROFILE_BY_USERNAME(normalizedusersname);
        const cachedProfile = await CacheService_1.cacheService.get(cacheKey);
        if (cachedProfile) {
            res.json(cachedProfile);
            return;
        }
        // Find user by username 
        const user = await database_1.prisma.users.findFirst({
            where: {
                username: normalizedusersname,
                isActive: true
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                location: true,
                bio: true,
                avatar: true,
                isVerified: true,
                createdAt: true,
                event_planners: {
                    select: {
                        companyName: true,
                        website: true
                    }
                },
                creative_profiles: {
                    select: {
                        categories: true,
                        portfolioImages: true,
                        portfolioLinks: true,
                        hourlyRate: true,
                        dailyRate: true,
                        experience: true,
                        skills: true,
                        languages: true,
                        isAvailable: true,
                        responseTime: true,
                        travelRadius: true,
                        certifications: true,
                        awards: true,
                        socialMedia: true
                    }
                },
                reviews_reviews_revieweeIdTousers: {
                    where: {
                        isPublic: true
                    },
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        users_reviews_reviewerIdTousers: {
                            select: {
                                name: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                }
            }
        });
        if (!user) {
            res.status(404).json({
                error: 'Profile not found',
                message: 'No public profile exists for this username'
            });
            return;
        }
        // Calculate review statistics
        const reviewStats = user.reviews_reviews_revieweeIdTousers.length > 0 ? {
            totalReviews: user.reviews_reviews_revieweeIdTousers.length,
            averageRating: user.reviews_reviews_revieweeIdTousers.reduce((sum, review) => sum + review.rating, 0) / user.reviews_reviews_revieweeIdTousers.length,
            ratingDistribution: {
                5: user.reviews_reviews_revieweeIdTousers.filter((r) => r.rating === 5).length,
                4: user.reviews_reviews_revieweeIdTousers.filter((r) => r.rating === 4).length,
                3: user.reviews_reviews_revieweeIdTousers.filter((r) => r.rating === 3).length,
                2: user.reviews_reviews_revieweeIdTousers.filter((r) => r.rating === 2).length,
                1: user.reviews_reviews_revieweeIdTousers.filter((r) => r.rating === 1).length,
            }
        } : null;
        // Build public profile response
        const publicProfile = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            location: user.location,
            bio: user.bio,
            avatar: user.avatar,
            isVerified: user.isVerified,
            memberSince: user.createdAt,
            profileUrl: `/${user.username}`,
            ...(user.event_planners && {
                eventPlanner: user.event_planners
            }),
            ...(user.creative_profiles && {
                creative_profiles: {
                    ...user.creative_profiles,
                    // Don't expose sensitive rate information in public profile
                    hourlyRate: user.creative_profiles.hourlyRate ? 'Available on request' : null,
                    dailyRate: user.creative_profiles.dailyRate ? 'Available on request' : null
                }
            }),
            reviews: {
                ...reviewStats,
                recent: user.reviews_reviews_revieweeIdTousers.slice(0, 5).map(review => ({
                    ...review,
                    users_reviews_reviewerIdTousers: review.users_reviews_reviewerIdTousers
                }))
            }
        };
        // Cache the public profile
        await CacheService_1.cacheService.set(cacheKey, publicProfile, CacheService_1.CacheService.TTL.USER_PROFILE);
        res.json(publicProfile);
    }
    catch (error) {
        logger_1.logger.error('Error fetching public profile:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch public profile'
        });
    }
});
exports.default = router;
//# sourceMappingURL=profiles.js.map