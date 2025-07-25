import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { verifyFirebaseToken } from '../../config/firebase';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';
import { logger } from '../../utils/logger';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { email, name, role, firebaseUid, token: firebaseToken, username } = req.body;

    try {
      // Verify Firebase token if provided
      let verifiedFirebaseUser;
      if (firebaseToken) {
        verifiedFirebaseUser = await verifyFirebaseToken(firebaseToken);
        
        if (verifiedFirebaseUser.email !== email) {
          throw createError('Email mismatch with Firebase token', 400);
        }
      } else if (firebaseUid) {
        // For backward compatibility, handle direct firebaseUid
        verifiedFirebaseUser = { uid: firebaseUid, email };
      } else {
        throw createError('Either token or firebaseUid is required', 400);
      }

      const actualFirebaseUid = verifiedFirebaseUser.uid;

      // Check if user already exists
      const existingusers = await prisma.users.findFirst({
        where: {
          OR: [
            { email },
            { firebaseUid: actualFirebaseUid }
          ]
        }
      });

      if (existingusers) {
        throw createError('User already exists', 409);
      }

      // Create user in database
      const newusers = await prisma.users.create({
        data: {
          email,
          name,
          role: role || 'user',
          firebaseUid: actualFirebaseUid,
          username: username || null // Don't auto-generate username for Google users
        }
      });

      // Create role-specific profile
      if (role === 'EVENT_PLANNER') {
        await prisma.event_planners.create({
          data: { userId: newusers.id },
        });
      } else if (role === 'CREATIVE_PROFESSIONAL') {
        await prisma.creative_profiles.create({
          data: { userId: newusers.id },
        });
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId: newusers.id, email: newusers.email, role: newusers.role },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'users registered successfully',
        user: newusers,
        token: jwtToken,
      });
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.users.findUnique({
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

  async getCurrentusers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.users.findUnique({
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
}
