import { Request, Response } from 'express';
import { cloudinary, uploadToCloudinary } from '../config/cloudinary';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types/express';

export class UploadController {
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('users not authenticated', 401);
      }

      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        'images',
        {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        }
      );

      res.json({
        message: 'Image uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('users not authenticated', 401);
      }

      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        'documents',
        {
          resource_type: 'auto',
        }
      );

      res.json({
        message: 'Document uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadMultiple(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw createError('users not authenticated', 401);
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw createError('No files uploaded', 400);
      }

      const uploadPromises = req.files.map((file: Express.Multer.File) =>
        uploadToCloudinary(file.buffer, 'uploads')
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        message: 'Files uploaded successfully',
        files: results.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        })),
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        'uploads',
        { resource_type: 'auto' }
      );

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        throw createError('Public ID is required', 400);
      }

      await cloudinary.uploader.destroy(publicId);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      throw error;
    }
  }

  async getSignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const { publicId, transformation } = req.query;

      if (!publicId) {
        throw createError('Public ID is required', 400);
      }

      const signedUrl = cloudinary.url(publicId as string, {
        transformation: transformation ? JSON.parse(transformation as string) : {},
        sign_url: true,
        secure: true
      });

      res.json({
        success: true,
        url: signedUrl
      });
    } catch (error) {
      throw error;
    }
  }
}
