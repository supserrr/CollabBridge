import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';
import { cloudinary, uploadToCloudinary } from '../../config/cloudinary';

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

  async uploadProfileImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      const userId = req.user!.id;
      const file = req.file;

      // Configure profile image upload with your specific settings
      const uploadOptions = {
        folder: 'profiles',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        overwrite: false,
        use_filename: false,
        unique_filename: false,
        use_filename_as_display_name: true,
        use_asset_folder_as_public_id_prefix: false,
        resource_type: 'image',
        type: 'upload'
      };

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file.buffer, 'profiles', uploadOptions);

      // Update user avatar in database
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: { avatar: result.secure_url },
        select: {
          id: true,
          avatar: true,
          name: true,
          displayName: true,
        },
      });

      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        user: updatedUser,
        file: {
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          size: file.size,
          format: result.format,
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
