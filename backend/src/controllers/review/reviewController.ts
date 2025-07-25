import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';

export class ReviewController {
  async createReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const {
      bookingId,
      rating,
      comment,
      skills,
      communication,
      professionalism,
      quality,
    } = req.body;

    // Verify booking exists and user is part of it
    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      include: {
        event_planners: { include: { users: true } },
        creative_profiles: { include: { users: true } },
      },
    });

    if (!booking) {
      throw createError('Booking not found', 404);
    }

    // Verify booking is completed
    if (booking.status !== 'COMPLETED') {
      throw createError('Can only review completed bookings', 400);
    }

    // Determine reviewer and reviewee
    let revieweeId: string;
    let professionalId: string | null = null;
    const isEventPlanner = booking.event_planners.users.id === userId;
    const isProfessional = booking.creative_profiles.users.id === userId;

    if (!isEventPlanner && !isProfessional) {
      throw createError('Unauthorized to review this booking', 403);
    }

    if (isEventPlanner) {
      revieweeId = booking.creative_profiles.users.id;
      professionalId = booking.professionalId;
    } else {
      revieweeId = booking.event_planners.users.id;
    }

    // Check if review already exists
    const existingReview = await prisma.reviews.findFirst({
      where: {
        bookingId,
        reviewerId: userId,
      },
    });

    if (existingReview) {
      throw createError('Review already exists for this booking', 409);
    }

    const review = await prisma.reviews.create({
      data: {
        bookingId,
        reviewerId: userId,
        revieweeId,
        professionalId,
        rating,
        comment,
        skills: skills || [],
        communication,
        professionalism,
        quality,
      },
      include: {
        users_reviews_reviewerIdTousers: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        users_reviews_revieweeIdTousers: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        bookings: {
          include: {
            events: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review,
    });
  }

  async getReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, userId, professionalId } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (userId) where.revieweeId = userId;
      if (professionalId) where.professionalId = professionalId;

      const [reviews, total] = await Promise.all([
        prisma.reviews.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            users_reviews_reviewerIdTousers: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
            users_reviews_revieweeIdTousers: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            bookings: {
              include: {
                events: {
                  select: {
                    id: true,
                    title: true,
                    eventType: true,
                  },
                },
              },
            },
          },
        }),
        prisma.reviews.count({ where }),
      ]);

      res.json({
        success: true,
        reviews,
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

  async getReviewById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const review = await prisma.reviews.findUnique({
        where: { id },
        include: {
          users_reviews_reviewerIdTousers: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
          users_reviews_revieweeIdTousers: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          bookings: {
            include: {
              events: {
                select: {
                  id: true,
                  title: true,
                  eventType: true,
                },
              },
            },
          },
        },
      });

      if (!review) {
        throw createError('Review not found', 404);
      }

      res.json({
        success: true,
        review,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const review = await prisma.reviews.findUnique({
        where: { id },
      });

      if (!review) {
        throw createError('Review not found', 404);
      }

      if (review.reviewerId !== userId) {
        throw createError('Not authorized to update this review', 403);
      }

      const updatedReview = await prisma.reviews.update({
        where: { id },
        data: req.body,
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
      });

      res.json({
        success: true,
        message: 'Review updated successfully',
        review: updatedReview,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const review = await prisma.reviews.findUnique({
        where: { id },
      });

      if (!review) {
        throw createError('Review not found', 404);
      }

      if (review.reviewerId !== userId && req.user!.role !== 'ADMIN') {
        throw createError('Not authorized to delete this review', 403);
      }

      await prisma.reviews.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}
