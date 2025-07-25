import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from './auth';
import { createError } from './errorHandler';

export const verifyUsernameOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Authentication required', 401);
    }

    const user = await prisma.users.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.id !== userId) {
      throw createError('Access denied', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyProjectOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Authentication required', 401);
    }

    // First verify username ownership
    const user = await prisma.users.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user || user.id !== userId) {
      throw createError('Access denied', 403);
    }

    // Then verify project ownership
    const project = await prisma.projects.findFirst({
      where: { 
        id: projectId,
        userId
      }
    });

    if (!project) {
      throw createError('Project not found', 404);
    }

    next();
  } catch (error) {
    next(error);
  }
};
