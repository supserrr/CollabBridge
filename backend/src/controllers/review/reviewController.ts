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
    let professionalId: string | null = null;
    const isEventPlanner = booking.eventPlanner.userId === userId;
    const isProfessional = booking.professional.userId === userId;

    if (!isEventPlanner && !isProfessional) {
      throw createError('Unauthorized to review this booking', 403);
    }

    if (isEventPlanner) {
      revieweeId = booking.professional.userId;
      professionalId = booking.professionalId;
    } else {
      revieweeId = booking.eventPlanner.userId;
    }

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
        professionalId,
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
      message: 'Review created successfully',
      review,
    });
  }

  async getReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: userId,
        isPublic: true,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        booking: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                eventType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    const total = await prisma.review.count({
      where: {
        revieweeId: userId,
        isPublic: true,
      },
    });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: {
        revieweeId: userId,
        isPublic: true,
      },
      _avg: {
        rating: true,
        communication: true,
        professionalism: true,
        quality: true,
      },
    });

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      averageRatings: {
        overall: Number((avgRating._avg.rating || 0).toFixed(1)),
        communication: Number((avgRating._avg.communication || 0).toFixed(1)),
        professionalism: Number((avgRating._avg.professionalism || 0).toFixed(1)),
        quality: Number((avgRating._avg.quality || 0).toFixed(1)),
      },
    });
  }

  async getMyReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { type = 'received', page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = type === 'given' 
      ? { reviewerId: userId }
      : { revieweeId: userId };

    const reviews = await prisma.review.findMany({
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
        booking: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                eventType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    const total = await prisma.review.count({ where });

    res.json({
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

    // Verify ownership
    const review = await prisma.review.findFirst({
      where: {
        id,
        reviewerId: userId,
      },
    });

    if (!review) {
      throw createError('Review not found or unauthorized', 404);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
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
      },
    });

    res.json({
      message: 'Review updated successfully',
      review: updatedReview,
    });
  }
}
