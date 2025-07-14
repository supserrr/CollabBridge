import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateUser } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,webp,pdf').split(',');
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExtension && allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// All routes require authentication
router.use(authenticateUser);

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'collabbridge/images',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    res.json({
      message: 'Image uploaded successfully',
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    });
  } catch (error) {
    throw error;
  }
});

router.post('/document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'collabbridge/documents',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    res.json({
      message: 'Document uploaded successfully',
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
      originalName: req.file.originalname,
    });
  } catch (error) {
    throw error;
  }
});

router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'collabbridge/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file!.buffer);
    });

    res.json({
      message: 'Avatar uploaded successfully',
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    });
  } catch (error) {
    throw error;
  }
});

router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    await cloudinary.uploader.destroy(publicId);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    throw error;
  }
});

export { router as uploadRoutes };
