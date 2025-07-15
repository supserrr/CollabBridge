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
