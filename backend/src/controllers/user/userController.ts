import { Response } from 'express';
import { prisma } from '../../config/database';
import { createError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, bio, location, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name,
        bio,
        location,
        phone,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  }

  async updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar },
    });

    res.json({
      message: 'Avatar updated successfully',
      user,
    });
  }

  async deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { isActive: false },
    });

    res.json({
      message: 'Account deactivated successfully',
    });
  }
}
