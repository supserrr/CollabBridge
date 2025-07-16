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
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        eventPlanner: true,
        professional: true,
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
    const isEventPlanner = booking.eventPlanner.userId === userId;
    const isProfessional = booking.professional.userId === userId;

    if (!isEventPlanner && !isProfessional) {
      throw createError('Unauthorized to review this booking', 403);
    }

    revieweeId = isEventPlanner ? booking.professional.userId : booking.eventPlanner.userId;

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        reviewerId: userId,
      },
    });

    if (existingReview) {
      throw createError('Review already exists for this booking', 409);
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId: userId,
        revieweeId,
        rating,
        comment,
        skills: skills || [],
        communication,
        professionalism,
        quality,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        booking: {
          include: {
            event: {
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

  async getUserReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total, avgRating] = await Promise.all([
      prisma.review.findMany({
        where: { revieweeId: userId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          booking: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  eventType: true,
                }
              }
            }
          }
        },
      }),
      prisma.review.count({ where: { revieweeId: userId } }),
      prisma.review.aggregate({
        where: { revieweeId: userId },
        _avg: {
          rating: true,
          communication: true,
          professionalism: true,
          quality: true,
        },
      }),
    ]);

    res.json({
      success: true,
      reviews,
      averageRating: avgRating._avg.rating || 0,
      averageScores: {
        communication: avgRating._avg.communication || 0,
        professionalism: avgRating._avg.professionalism || 0,
        quality: avgRating._avg.quality || 0,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  async getMyReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { type = 'received', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereCondition = type === 'given' 
      ? { reviewerId: userId }
      : { revieweeId: userId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereCondition,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          reviewee: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          booking: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  eventType: true,
                }
              }
            }
          }
        },
      }),
      prisma.review.count({ where: whereCondition }),
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
  }

  async updateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw createError('Review not found', 404);
    }

    if (review.reviewerId !== userId) {
      throw createError('Unauthorized to update this review', 403);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
      },
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview,
    });
  }

  async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw createError('Review not found', 404);
    }

    if (review.reviewerId !== userId) {
      throw createError('Unauthorized to delete this review', 403);
    }

    await prisma.review.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  }

  async reportReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason, description } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw createError('Review not found', 404);
    }

    // Check if already reported by this user
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: userId,
        targetType: 'REVIEW',
        targetId: id,
      },
    });

    if (existingReport) {
      throw createError('Review already reported', 409);
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        targetType: 'REVIEW',
        targetId: id,
        reason,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review reported successfully',
      report: { id: report.id },
    });
  }
}
