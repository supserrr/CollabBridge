"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const NotificationService_1 = require("../services/NotificationService");
class ReviewController {
    constructor() {
        this.notificationService = new NotificationService_1.NotificationService();
    }
    async create(req, res) {
        const userId = req.user?.id;
        const { bookingId } = req.params;
        if (!userId) {
            throw new errors_1.HttpError('users not authenticated', 401);
        }
        // Check if booking exists and user has access
        const booking = await database_1.prisma.bookings.findUnique({
            where: { id: bookingId },
            include: {
                event_planners: true,
                creative_profiles: true,
                events: true
            }
        });
        if (!booking) {
            throw new errors_1.HttpError('Booking not found', 404);
        }
        // Verify the user is part of the booking
        const isEventPlanner = booking.event_planners.userId === userId;
        const isProfessional = booking.creative_profiles.userId === userId;
        if (!isEventPlanner && !isProfessional) {
            throw new errors_1.HttpError('Unauthorized to review this booking', 403);
        }
        // Check if review already exists
        const hasExistingReview = await this.checkExistingReview(req);
        if (hasExistingReview) {
            throw new errors_1.HttpError('Review already exists for this booking', 400);
        }
        // Create the review
        const review = await database_1.prisma.reviews.create({
            data: {
                bookingId: bookingId,
                reviewerId: userId,
                revieweeId: isEventPlanner ? booking.creative_profiles.userId : booking.event_planners.userId,
                rating: req.body.rating,
                comment: req.body.comment,
            },
            include: {
                bookings: true,
                users_reviews_reviewerIdTousers: true,
                users_reviews_revieweeIdTousers: true
            }
        });
        res.status(201).json(review);
    }
    async getReviews(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const [reviews, total, averageRating] = await Promise.all([
                database_1.prisma.reviews.findMany({
                    where: { revieweeId: userId },
                    include: {
                        users_reviews_reviewerIdTousers: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: Number(limit),
                }),
                database_1.prisma.reviews.count({
                    where: { revieweeId: userId },
                }),
                database_1.prisma.reviews.aggregate({
                    where: { revieweeId: userId },
                    _avg: { rating: true },
                }),
            ]);
            res.json({
                reviews,
                averageRating: averageRating._avg.rating || 0,
                totalReviews: total,
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
    async getMyReviews(req, res) {
        try {
            const { type = 'received', page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = type === 'received'
                ? { revieweeId: req.user.id }
                : { reviewerId: req.user.id };
            const [reviews, total] = await Promise.all([
                database_1.prisma.reviews.findMany({
                    where,
                    include: {
                        users_reviews_reviewerIdTousers: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                        users_reviews_revieweeIdTousers: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: Number(limit),
                }),
                database_1.prisma.reviews.count({ where }),
            ]);
            let averageRating = 0;
            if (type === 'received') {
                const avg = await database_1.prisma.reviews.aggregate({
                    where: { revieweeId: req.user.id },
                    _avg: { rating: true },
                });
                averageRating = avg._avg.rating || 0;
            }
            res.json({
                reviews,
                averageRating,
                totalReviews: total,
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
    async updateReview(req, res) {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;
            const review = await database_1.prisma.reviews.findUnique({
                where: { id },
            });
            if (!review) {
                throw new errors_1.HttpError('Review not found', 404);
            }
            if (review.reviewerId !== req.user.id) {
                throw new errors_1.HttpError('Not authorized to update this review', 403);
            }
            // Check if review is not older than 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            if (review.createdAt < thirtyDaysAgo) {
                throw new errors_1.HttpError('Cannot update reviews older than 30 days', 400);
            }
            const updatedReview = await database_1.prisma.reviews.update({
                where: { id },
                data: { rating, comment },
                include: {
                    users_reviews_reviewerIdTousers: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                    users_reviews_revieweeIdTousers: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            res.json({ message: 'Review updated successfully', review: updatedReview });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteReview(req, res) {
        try {
            const { id } = req.params;
            const review = await database_1.prisma.reviews.findUnique({
                where: { id },
            });
            if (!review) {
                throw new errors_1.HttpError('Review not found', 404);
            }
            if (review.reviewerId !== req.user.id) {
                throw new errors_1.HttpError('Not authorized to delete this review', 403);
            }
            // Check if review is not older than 7 days
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (review.createdAt < sevenDaysAgo) {
                throw new errors_1.HttpError('Cannot delete reviews older than 7 days', 400);
            }
            await database_1.prisma.reviews.delete({
                where: { id },
            });
            res.json({ message: 'Review deleted successfully' });
        }
        catch (error) {
            throw error;
        }
    }
    async checkExistingReview(req) {
        const userId = req.user?.id;
        const { bookingId } = req.params;
        const booking = await database_1.prisma.bookings.findUnique({
            where: { id: bookingId },
            include: {
                event_planners: true,
                creative_profiles: true
            }
        });
        if (!booking) {
            throw new errors_1.HttpError('Booking not found', 404);
        }
        // Check if review exists based on user role
        const isEventPlanner = booking.event_planners?.userId === userId;
        const isProfessional = booking.creative_profiles?.userId === userId;
        const existingReview = await database_1.prisma.reviews.findFirst({
            where: {
                bookingId,
                reviewerId: userId,
                revieweeId: isEventPlanner ? booking.creative_profiles.userId : booking.event_planners.userId
            }
        });
        return !!existingReview;
    }
}
exports.ReviewController = ReviewController;
//# sourceMappingURL=ReviewController.js.map