import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { verifyIdToken } from '../../config/firebase';
import { AuthenticatedRequest } from '../../middleware/auth';

export class AuthController {
  async register(req: any, res: Response): Promise<void> {
    const { email, name, role, firebaseUid } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { firebaseUid },
        ],
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
      },
    });

    // Create role-specific profile
    if (role === 'EVENT_PLANNER') {
      await prisma.eventPlanner.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === 'CREATIVE_PROFESSIONAL') {
      await prisma.creativeProfile.create({
        data: {
          userId: user.id,
          categories: [],
          skills: [],
        },
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
  }

  async login(req: any, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      throw createError('Token is required', 400);
    }

    try {
      const decodedToken = await verifyIdToken(token);
      
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        message: 'Login successful',
        user,
      });
    } catch (error) {
      throw createError('Invalid token', 401);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Update user last active time
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { lastActiveAt: new Date() },
    });

    res.json({ message: 'Logout successful' });
  }

  async verifyToken(req: any, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      throw createError('Token is required', 400);
    }

    try {
      const decodedToken = await verifyIdToken(token);
      
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        valid: true,
        user,
      });
    } catch (error) {
      throw createError('Invalid token', 401);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        eventPlanner: true,
        creativeProfile: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json(user);
  }
}
