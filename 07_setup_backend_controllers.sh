#!/bin/bash

# CollabBridge - Backend Controllers Setup
echo "🎮 Setting up CollabBridge backend controllers..."

cd collabbridge-project/backend

# Create AuthController
echo "🔐 Creating src/controllers/AuthController.ts..."
cat > src/controllers/AuthController.ts << 'EOF'
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { auth } from '../config/firebase';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseUid, email, name, role, location, bio } = req.body;

      // Validate required fields
      if (!firebaseUid || !email || !name || !role) {
        throw createError('Missing required fields', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { firebaseUid },
            { email }
          ]
        }
      });

      if (existingUser) {
        throw createError('User already exists', 409);
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          firebaseUid,
          email,
          name,
          role: role as UserRole,
          location,
          bio,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          location: true,
          bio: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Create role-specific profile
      if (role === UserRole.EVENT_PLANNER) {
        await prisma.eventPlanner.create({
          data: {
            userId: user.id,
          },
        });
      } else if (role === UserRole.CREATIVE_PROFESSIONAL) {
        await prisma.creativeProfile.create({
          data: {
            userId: user.id,
            categories: [],
            skills: [],
            languages: ['en'],
          },
        });
      }

      res.status(201).json({
        message: 'User registered successfully',
        user,
      });
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw createError('Token is required', 400);
      }

      // Verify Firebase token
      const decodedToken = await auth.verifyIdToken(token);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          name: true,
          role: true,
          location: true,
          bio: true,
          avatar: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (!user.isActive) {
        throw createError('Account deactivated', 403);
      }

      // Update last active
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      res.json({
        message: 'Token verified successfully',
        user,
      });
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw createError('Refresh token is required', 400);
      }

      // Verify refresh token with Firebase
      const decodedToken = await auth.verifyIdToken(refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        uid: decodedToken.uid,
      });
    } catch (error) {
      throw createError('Invalid refresh token', 401);
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      // Log activity
      await prisma.userActivity.create({
        data: {
          userId: req.user.id,
          activityType: 'LOGOUT',
          metadata: {
            timestamp: new Date(),
            ip: req.ip,
          },
        },
      });

      res.json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          eventPlanner: true,
          creativeProfile: {
            include: {
              certifications: true,
            },
          },
          _count: {
            select: {
              sentMessages: true,
              receivedMessages: true,
              eventApplications: true,
              bookings: true,
            },
          },
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        user,
      });
    } catch (error) {
      throw error;
    }
  }
}
EOF

# Create UserController
echo "👤 Creating src/controllers/UserController.ts..."
cat > src/controllers/UserController.ts << 'EOF'
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { uploadToCloudinary } from '../config/cloudinary';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          eventPlanner: true,
          creativeProfile: {
            include: {
              certifications: true,
              unavailableDates: true,
            },
          },
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({ user });
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { name, location, bio, phone, timezone, language } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name,
          location,
          bio,
          phone,
          timezone,
          language,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          location: true,
          bio: true,
          phone: true,
          timezone: true,
          language: true,
          avatar: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatar(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        req.file.buffer,
        'avatars',
        {
          width: 200,
          height: 200,
          crop: 'fill',
          gravity: 'face',
        }
      );

      // Update user avatar
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: result.secure_url },
        select: {
          id: true,
          avatar: true,
        },
      });

      res.json({
        message: 'Avatar uploaded successfully',
        avatar: updatedUser.avatar,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteAvatar(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: null },
      });

      res.json({
        message: 'Avatar deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  async getCreativeProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const profile = await prisma.creativeProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              location: true,
              avatar: true,
              createdAt: true,
            },
          },
          certifications: true,
          unavailableDates: true,
          _count: {
            select: {
              applications: true,
              bookings: true,
            },
          },
        },
      });

      if (!profile) {
        throw createError('Creative profile not found', 404);
      }

      res.json({ profile });
    } catch (error) {
      throw error;
    }
  }

  async updateCreativeProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const {
        categories,
        portfolioLinks,
        hourlyRate,
        dailyRate,
        experience,
        equipment,
        skills,
        languages,
        workingHours,
        isAvailable,
        responseTime,
      } = req.body;

      const updatedProfile = await prisma.creativeProfile.update({
        where: { userId: req.user.id },
        data: {
          categories,
          portfolioLinks,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          dailyRate: dailyRate ? parseFloat(dailyRate) : null,
          experience,
          equipment,
          skills,
          languages,
          workingHours,
          isAvailable,
          responseTime: responseTime ? parseInt(responseTime) : null,
        },
      });

      res.json({
        message: 'Creative profile updated successfully',
        profile: updatedProfile,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadPortfolio(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw createError('No files uploaded', 400);
      }

      // Upload images to Cloudinary
      const uploadPromises = req.files.map((file: Express.Multer.File) =>
        uploadToCloudinary(file.buffer, 'portfolio', {
          width: 800,
          height: 600,
          crop: 'limit',
        })
      );

      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map((result) => result.secure_url);

      // Update creative profile
      const profile = await prisma.creativeProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        throw createError('Creative profile not found', 404);
      }

      const updatedProfile = await prisma.creativeProfile.update({
        where: { userId: req.user.id },
        data: {
          portfolioImages: [...profile.portfolioImages, ...imageUrls],
        },
      });

      res.json({
        message: 'Portfolio images uploaded successfully',
        images: imageUrls,
        totalImages: updatedProfile.portfolioImages.length,
      });
    } catch (error) {
      throw error;
    }
  }

  async getEventPlannerProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const profile = await prisma.eventPlanner.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              location: true,
              avatar: true,
              createdAt: true,
            },
          },
          events: {
            include: {
              _count: {
                select: {
                  applications: true,
                  bookings: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              events: true,
              bookings: true,
            },
          },
        },
      });

      if (!profile) {
        throw createError('Event planner profile not found', 404);
      }

      res.json({ profile });
    } catch (error) {
      throw error;
    }
  }

  async updateEventPlannerProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { companyName, website, taxId } = req.body;

      const updatedProfile = await prisma.eventPlanner.update({
        where: { userId: req.user.id },
        data: {
          companyName,
          website,
          taxId,
        },
      });

      res.json({
        message: 'Event planner profile updated successfully',
        profile: updatedProfile,
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const activities = await prisma.userActivity.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      });

      const total = await prisma.userActivity.count({
        where: { userId: req.user.id },
      });

      res.json({
        activities,
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

  async getUserStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          _count: {
            select: {
              sentMessages: true,
              receivedMessages: true,
              eventApplications: true,
              bookings: true,
              givenReviews: true,
              receivedReviews: true,
              favorites: true,
            },
          },
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Get average rating
      const avgRating = await prisma.review.aggregate({
        where: { receiverId: req.user.id },
        _avg: { rating: true },
      });

      res.json({
        stats: {
          ...user._count,
          averageRating: avgRating._avg.rating || 0,
          joinedDate: user.createdAt,
          lastActive: user.lastActiveAt,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
EOF

echo "✅ User and Auth controllers created successfully!"
echo ""
echo "📋 What was created:"
echo "• AuthController - Registration, login, token verification"
echo "• UserController - Profile management, avatar upload, stats"
echo ""
echo "🔥 Next: Continue with more controllers..."
          