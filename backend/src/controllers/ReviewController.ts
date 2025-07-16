import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { NotificationService } from '../services/NotificationService';

export class ReviewController {
  private notificationService = new NotificationService();

  async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { receiverId, rating, comment, eventId } = req.body;

      // Validate rating
      if (rating < 1 || rating > 5) {
        throw createError('Rating must be between 1 and 5', 400);
      }

      // Check if reviewer and reviewee have worked together
      const booking = await prisma.booking.findFirst({
        where: {
          eventId,
          status: 'COMPLETED',
          OR: [
            { 
              planner: { userId: req.user!.id },
              creative: { userId: receiverId }
            },
            { 
              creative: { userId: req.user!.id },
              planner: { userId: receiverId }
            }
          ],
        },
      });

      if (!booking) {
        throw createError('You can only review users you have worked with', 400);
      }

      // Check if review already exists
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewerId: req.user!.id,
          revieweeId: receiverId,
          bookingId: eventId,
        },
      });

      if (existingReview) {
        throw createError('You have already reviewed this user for this event', 409);
      }

      const review = await prisma.review.create({
        data: {
          reviewerId: req.user!.id,
          revieweeId: receiverId,
          bookingId: eventId,
          rating,
          comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Send notification to reviewee
      await this.notificationService.sendNotification(
        receiverId,
        'REVIEW_RECEIVED',
        'New Review Received',
        `${review.reviewer.name} left you a ${rating}-star review`,
        { reviewId: review.id, eventId }
      );

      res.status(201).json({ message: 'Review created successfully', review });
    } catch (error) {
      throw error;
    }
  }

  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [reviews, total, averageRating] = await Promise.all([
        prisma.review.findMany({
          where: { revieweeId: userId },
          include: {
            reviewer: {
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
        prisma.review.count({
          where: { revieweeId: userId },
        }),
        prisma.review.aggregate({
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
    } catch (error) {
      throw error;
    }
  }

  async getMyReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type = 'received', page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where = type === 'received' 
        ? { revieweeId: req.user!.id }
        : { reviewerId: req.user!.id };

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            reviewee: {
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
        prisma.review.count({ where }),
      ]);

      let averageRating = 0;
      if (type === 'received') {
        const avg = await prisma.review.aggregate({
          where: { revieweeId: req.user!.id },
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
    } catch (error) {
      throw error;
    }
  }

  async updateReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw createError('Review not found', 404);
      }

      if (review.reviewerId !== req.user!.id) {
        throw createError('Not authorized to update this review', 403);
      }

      // Check if review is not older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (review.createdAt < thirtyDaysAgo) {
        throw createError('Cannot update reviews older than 30 days', 400);
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data: { rating, comment },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({ message: 'Review updated successfully', review: updatedReview });
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw createError('Review not found', 404);
      }

      if (review.reviewerId !== req.user!.id) {
        throw createError('Not authorized to delete this review', 403);
      }

      // Check if review is not older than 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (review.createdAt < sevenDaysAgo) {
        throw createError('Cannot delete reviews older than 7 days', 400);
      }

      await prisma.review.delete({
        where: { id },
      });

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      throw error;
    }
  }
}
