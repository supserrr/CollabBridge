import { Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';

export class usersController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          event_planners: true,
          creative_profiles: {
            include: {
              reviews: {
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
                take: 5,
              },
            },
          },
        },
      });

      if (!user) {
        throw createError('users not found', 404);
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
      const userRole = req.user!.role;
      const { 
        name, 
        bio, 
        location, 
        phone, 
        // Creative professional fields
        specialization, 
        experience, 
        hourlyRate, 
        availability,
        skills,
        equipment,
        travelRadius
      } = req.body;

      // Update basic user info
      const updatedUser = await prisma.users.update({
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

      let updatedProfile = null;
      
      // If user is a creative professional, update their profile too
      if (userRole === 'CREATIVE_PROFESSIONAL') {
        // Prepare creative profile data
        const creativeProfileData: any = {};
        
        if (specialization) {
          creativeProfileData.categories = [specialization];
        }
        if (experience) {
          creativeProfileData.experience = experience;
        }
        if (hourlyRate) {
          creativeProfileData.hourlyRate = parseFloat(hourlyRate);
        }
        if (skills && Array.isArray(skills)) {
          creativeProfileData.skills = skills;
        }
        if (equipment) {
          creativeProfileData.equipment = equipment;
        }
        if (travelRadius) {
          creativeProfileData.travelRadius = parseInt(travelRadius);
        }
        if (availability) {
          // Map availability to boolean for isAvailable
          creativeProfileData.isAvailable = availability !== 'unavailable';
        }

        // Only update if we have profile data to update
        if (Object.keys(creativeProfileData).length > 0) {
          updatedProfile = await prisma.creative_profiles.upsert({
            where: { userId },
            update: creativeProfileData,
            create: {
              userId,
              ...creativeProfileData,
            },
            select: {
              id: true,
              categories: true,
              hourlyRate: true,
              experience: true,
              skills: true,
              equipment: true,
              isAvailable: true,
              travelRadius: true,
              updatedAt: true,
            },
          });
        }
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
        ...(updatedProfile && { profile: updatedProfile }),
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

      const updatedusers = await prisma.users.update({
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
        user: updatedusers,
      });
    } catch (error) {
      throw error;
    }
  }

  async deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await prisma.users.update({
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

  async updateUsername(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { username } = req.body;

      // Check if username is already taken
      const existingUser = await prisma.users.findUnique({
        where: { username }
      });

      if (existingUser && existingUser.id !== userId) {
        throw createError('Username is already taken', 400);
      }

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: { username },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        message: 'Username updated successfully',
        user: updatedUser
      });
    } catch (error) {
      throw error;
    }
  }
}
