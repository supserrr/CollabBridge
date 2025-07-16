import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { verifyFirebaseToken } from '../../config/firebase';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';
import { logger } from '../../utils/logger';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { email, name, role, firebaseUid } = req.body;

    try {
      // Verify Firebase token
      const firebaseUser = await verifyFirebaseToken(firebaseUid);
      
      if (firebaseUser.email !== email) {
        throw createError('Email mismatch with Firebase token', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { firebaseUid }
          ]
        }
      });

      if (existingUser) {
        throw createError('User already exists', 409);
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          firebaseUid,
          isVerified: firebaseUser.email_verified || false,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Create role-specific profile
      if (role === 'EVENT_PLANNER') {
        await prisma.eventPlanner.create({
          data: { userId: user.id },
        });
      } else if (role === 'CREATIVE_PROFESSIONAL') {
        await prisma.creativeProfile.create({
          data: { userId: user.id },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw createError('Invalid or inactive user', 401);
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      throw createError('Invalid token', 401);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          location: true,
          bio: true,
          avatar: true,
          phone: true,
          isVerified: true,
          language: true,
          createdAt: true,
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
}
