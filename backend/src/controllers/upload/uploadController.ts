import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';
import { cloudinary } from '../../config/cloudinary';

export class UploadController {
  async uploadSingle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      const file = req.file as any;
      
      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          url: file.path,
          publicId: file.filename,
          originalName: file.originalname,
          size: file.size,
          format: file.format,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadMultiple(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw createError('No files uploaded', 400);
      }

      const files = (req.files as any[]).map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        format: file.format,
      }));

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        files,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok') {
        throw createError('Failed to delete file', 400);
      }

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }
}
