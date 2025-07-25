import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class SavedProfessionalsController {
  // Save a professional
  async saveProfessional(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { professionalId } = req.params;
      const userId = req.user!.id;

      // Get the event planner profile
      const eventPlanner = await prisma.event_planners.findUnique({
        where: { userId }
      });

      if (!eventPlanner) {
        throw createError('Only event planners can save professionals', 403);
      }

      // Check if professional exists
      const professional = await prisma.creative_profiles.findUnique({
        where: { id: professionalId }
      });

      if (!professional) {
        throw createError('Professional not found', 404);
      }

      // Check if already saved
      const existingSave = await prisma.saved_professionals.findUnique({
        where: {
          eventPlannerId_professionalId: {
            eventPlannerId: eventPlanner.id,
            professionalId
          }
        }
      });

      if (existingSave) {
        throw createError('Professional already saved', 409);
      }

      // Save the professional
      const savedProfessional = await prisma.saved_professionals.create({
        data: {
          eventPlannerId: eventPlanner.id,
          professionalId
        },
        include: {
          creative_profiles: {
            include: {
              users: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                  location: true,
                  role: true
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Professional saved successfully',
        data: savedProfessional
      });
    } catch (error) {
      console.error('Error saving professional:', error);
      throw error;
    }
  }

  // Unsave a professional
  async unsaveProfessional(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { professionalId } = req.params;
      const userId = req.user!.id;

      // Get the event planner profile
      const eventPlanner = await prisma.event_planners.findUnique({
        where: { userId }
      });

      if (!eventPlanner) {
        throw createError('Only event planners can unsave professionals', 403);
      }

      // Remove the saved professional
      const deletedSave = await prisma.saved_professionals.delete({
        where: {
          eventPlannerId_professionalId: {
            eventPlannerId: eventPlanner.id,
            professionalId
          }
        }
      });

      res.json({
        success: true,
        message: 'Professional unsaved successfully'
      });
    } catch (error) {
      console.error('Error unsaving professional:', error);
      if ((error as any)?.code === 'P2025') {
        throw createError('Professional not saved', 404);
      }
      throw error;
    }
  }

  // Get saved professionals for an event planner
  async getSavedProfessionals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 12 } = req.query;

      // Get the event planner profile
      const eventPlanner = await prisma.event_planners.findUnique({
        where: { userId }
      });

      if (!eventPlanner) {
        throw createError('Only event planners can view saved professionals', 403);
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [savedProfessionals, totalCount] = await Promise.all([
        prisma.saved_professionals.findMany({
          where: { eventPlannerId: eventPlanner.id },
          include: {
            creative_profiles: {
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    location: true,
                    role: true
                  }
                }
              }
            }
          },
          orderBy: { savedAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.saved_professionals.count({
          where: { eventPlannerId: eventPlanner.id }
        })
      ]);

      const totalPages = Math.ceil(totalCount / Number(limit));

      res.json({
        success: true,
        data: savedProfessionals.map(save => ({
          id: save.creative_profiles.id,
          name: save.creative_profiles.users.name,
          username: save.creative_profiles.users.username,
          avatar: save.creative_profiles.users.avatar,
          location: save.creative_profiles.users.location,
          title: save.creative_profiles.categories.join(', '),
          bio: null, // Add bio if needed
          hourlyRate: save.creative_profiles.hourlyRate,
          experience: save.creative_profiles.experience,
          skills: save.creative_profiles.skills,
          rating: 4.8, // Mock rating - implement real reviews later
          reviewCount: 25, // Mock count
          availability: save.creative_profiles.isAvailable ? 'available' : 'busy',
          isVerified: true, // Mock verification
          portfolioImages: save.creative_profiles.portfolioImages,
          savedAt: save.savedAt
        })),
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      });
    } catch (error) {
      console.error('Error getting saved professionals:', error);
      throw error;
    }
  }

  // Get saved professional IDs for an event planner (for UI state)
  async getSavedProfessionalIds(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Get the event planner profile
      const eventPlanner = await prisma.event_planners.findUnique({
        where: { userId }
      });

      if (!eventPlanner) {
        res.json({ success: true, data: [] });
        return;
      }

      const savedProfessionals = await prisma.saved_professionals.findMany({
        where: { eventPlannerId: eventPlanner.id },
        select: { professionalId: true }
      });

      res.json({
        success: true,
        data: savedProfessionals.map(save => save.professionalId)
      });
    } catch (error) {
      console.error('Error getting saved professional IDs:', error);
      throw error;
    }
  }
}
