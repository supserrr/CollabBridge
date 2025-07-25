import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, role, firebaseUid, location, bio } = req.body;

      // Verify Firebase user exists
      await admin.auth().getUsers(firebaseUid);

      // Check if user already exists
      const existingusers = await prisma.users.findFirst({
        where: {
          OR: [{ email }, { firebaseUid }],
        },
      });

      if (existingusers) {
        throw createError('users already exists', 409);
      }

      // Create user
      const user = await prisma.users.create({
        data: {
          email,
          name,
          role,
          firebaseUid,
          location,
          bio,
        },
      });

      // Create role-specific profile
      if (role === 'EVENT_PLANNER') {
        await prisma.event_planners.create({
          data: { userId: user.id },
        });
      } else if (role === 'CREATIVE_PROFESSIONAL') {
        await prisma.creative_profiles.create({
          data: { userId: user.id },
        });
      }

      res.status(201).json({
        message: 'users registered successfully',
        users: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw createError('Token is required', 400);
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      
      const user = await prisma.users.findUnique({
        where: { firebaseUid: decodedToken.uid },
        include: {
          event_planners: true,
          creative_profiles: true,
        },
      });

      if (!user) {
        throw createError('users not found', 404);
      }

      res.json({
        valid: true,
        users: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.event_planners || user.creative_profiles,
        },
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    // This would typically involve Firebase Admin SDK
    res.json({ message: 'Token refresh handled by Firebase client SDK' });
  }
}
