import { Response } from 'express';
import { validationResult } from 'express-validator';
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

  async updateUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 422);
      }

      const userId = req.user!.id;
      const {
        name,
        displayName,
        email,
        username,
        bio,
        location,
        phone,
        categories,
        skills,
        experience,
        hourlyRate,
        dailyRate,
        portfolioImages,
        portfolioLinks,
        equipment,
        languages,
        certifications,
        awards,
        responseTime,
        travelRadius,
        availability,
        avatar,
      } = req.body;

      // Determine the final display name
      const finalDisplayName = displayName || name;

      // Build the update object for users table
      const updateData: any = {
        ...(name && { name }),
        ...(finalDisplayName && { displayName: finalDisplayName }),
        ...(email && { email }),
        ...(username && { username }),
        ...(bio && { bio }),
        ...(location && { location }),
        ...(phone !== undefined && { phone }),
        ...(avatar && { avatar }),
      };

      // Update the user
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: updateData,
        include: {
          creative_profiles: true,
        },
      });

      // Update creative profile if it exists and professional data is provided
      if (updatedUser.creative_profiles) {
        const creativeUpdateData: any = {};
        
        if (categories) creativeUpdateData.categories = Array.isArray(categories) ? categories : [categories];
        if (skills) creativeUpdateData.skills = Array.isArray(skills) ? skills : [skills];
        if (experience) creativeUpdateData.experience = experience;
        if (hourlyRate !== undefined) creativeUpdateData.hourlyRate = parseFloat(hourlyRate);
        if (dailyRate !== undefined) creativeUpdateData.dailyRate = parseFloat(dailyRate);
        if (portfolioImages) creativeUpdateData.portfolioImages = Array.isArray(portfolioImages) ? portfolioImages : [portfolioImages];
        if (portfolioLinks) creativeUpdateData.portfolioLinks = Array.isArray(portfolioLinks) ? portfolioLinks : [portfolioLinks];
        if (equipment) creativeUpdateData.equipment = equipment;
        if (languages) creativeUpdateData.languages = Array.isArray(languages) ? languages : [languages];
        if (certifications) creativeUpdateData.certifications = Array.isArray(certifications) ? certifications : [certifications];
        if (awards) creativeUpdateData.awards = Array.isArray(awards) ? awards : [awards];
        if (responseTime !== undefined) creativeUpdateData.responseTime = parseInt(responseTime);
        if (travelRadius !== undefined) creativeUpdateData.travelRadius = parseInt(travelRadius);
        if (availability !== undefined) creativeUpdateData.isAvailable = availability === 'available';

        // Only update if there's data to update
        if (Object.keys(creativeUpdateData).length > 0) {
          await prisma.creative_profiles.update({
            where: { userId: userId },
            data: creativeUpdateData,
          });
        }
      }

      // Fetch the complete updated user with creative profile
      const completeUser = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          displayName: true,
          email: true,
          username: true,
          bio: true,
          location: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          creative_profiles: {
            select: {
              id: true,
              categories: true,
              skills: true,
              experience: true,
              hourlyRate: true,
              dailyRate: true,
              portfolioImages: true,
              portfolioLinks: true,
              equipment: true,
              languages: true,
              certifications: true,
              awards: true,
              responseTime: true,
              travelRadius: true,
              isAvailable: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: completeUser,
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
