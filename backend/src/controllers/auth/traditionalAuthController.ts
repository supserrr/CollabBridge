import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

export class TraditionalAuthController {
  async signup(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName, username, role } = req.body;

    try {
      // Check if user already exists
      const existingUser = await prisma.users.findFirst({
        where: {
          OR: [
            { email },
            { username: username || undefined }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw createError('Email already exists', 409);
        }
        if (existingUser.username === username) {
          throw createError('Username already taken', 409);
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.users.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          username: username || null,
          role: role.toUpperCase() as 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL',
          isVerified: false,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Create role-specific profile
      if (role.toUpperCase() === 'EVENT_PLANNER') {
        await prisma.event_planners.create({
          data: { userId: user.id },
        });
      } else if (role.toUpperCase() === 'CREATIVE_PROFESSIONAL') {
        await prisma.creative_profiles.create({
          data: { userId: user.id },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: '7d' }
      );

      logger.info(`User signed up successfully: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    }
  }

  async signin(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await prisma.users.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          username: true,
          role: true,
          isVerified: true,
          isActive: true,
        },
      });

      if (!user) {
        throw createError('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw createError('Account is disabled', 401);
      }

      // Check password
      if (!user.password) {
        throw createError('Please use social login or reset your password', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: '7d' }
      );

      logger.info(`User signed in successfully: ${user.email}`);

      // Remove password from response
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
      };

      res.json({
        success: true,
        message: 'Signed in successfully',
        user: userResponse,
        token,
      });
    } catch (error) {
      logger.error('Signin error:', error);
      throw error;
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        throw createError('User not authenticated', 401);
      }

      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (!user.isActive) {
        throw createError('Account is disabled', 401);
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      throw error;
    }
  }
}
