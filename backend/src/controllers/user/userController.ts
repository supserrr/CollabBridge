import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          eventPlanner: true,
          creativeProfile: {
            include: {
              receivedReviews: {
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
                take: 5,
              },
            },
          },
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, bio, location, phone } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          bio,
          location,
          phone,
        },
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          location: true,
          phone: true,
          avatar: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      // File is already uploaded to Cloudinary via middleware
      const avatarUrl = (req.file as any).path;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
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
      throw error;
    }
  }

  async deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: 'Account deactivated successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}
