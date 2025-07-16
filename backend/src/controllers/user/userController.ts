import { Response } from 'express';
import { prisma } from '../../config/database';
import { cloudinary } from '../../config/cloudinary';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        eventPlanner: true,
        creativeProfile: {
          include: {
            _count: {
              select: {
                bookings: true,
                receivedReviews: true,
              }
            }
          }
        },
        receivedReviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
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
            receivedReviews: true,
            givenReviews: true,
          }
        }
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
    });

    res.json({
      success: true,
      user: {
        ...user,
        averageRating: avgRating._avg.rating || 0,
      },
    });
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { name, bio, location, phone, timezone, language } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(location && { location }),
        ...(phone && { phone }),
        ...(timezone && { timezone }),
        ...(language && { language }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        location: true,
        bio: true,
        avatar: true,
        phone: true,
        timezone: true,
        language: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  }

  async updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    
    if (!req.file) {
      throw createError('No file provided', 400);
    }

    try {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'collabbridge/avatars',
            transformation: [
              { width: 200, height: 200, crop: 'fill', gravity: 'face' },
              { quality: 'auto' },
              { format: 'webp' }
            ],
            public_id: `avatar_${userId}_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file!.buffer);
      });

      const uploadResult = result as any;

      // Update user avatar
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: uploadResult.secure_url },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });

      res.json({
        success: true,
        message: 'Avatar updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      throw createError('Failed to upload avatar', 500);
    }
  }

  async deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  }
}
