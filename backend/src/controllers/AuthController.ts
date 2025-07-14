import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { admin } from '../config/firebase';
import { createError } from '../middleware/errorHandler';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, role, firebaseUid, location, bio } = req.body;

      // Verify Firebase user exists
      await admin.auth().getUser(firebaseUid);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { firebaseUid }],
        },
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
          location,
          bio,
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

      res.status(201).json({
        message: 'User registered successfully',
        user: {
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
      
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        include: {
          eventPlanner: true,
          creativeProfile: true,
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.eventPlanner || user.creativeProfile,
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
