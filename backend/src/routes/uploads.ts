import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { cloudinary } from '../config/cloudinary';

const router = Router();

// Configure multer
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || 
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
    
    const fileExt = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExt && allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${fileExt} not allowed`));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Upload single file
router.post('/single',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'collabbridge/uploads',
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      });

      res.json({
        message: 'File uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
      });
    } catch (error) {
      throw createError('Failed to upload file', 500);
    }
  })
);

// Upload multiple files
router.post('/multiple',
  upload.array('files', 10), // Max 10 files
  asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw createError('No files uploaded', 400);
    }

    try {
      const uploadPromises = files.map(file =>
        cloudinary.uploader.upload(file.path, {
          folder: 'collabbridge/uploads',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
        })
      );

      const results = await Promise.all(uploadPromises);

      const uploadedFiles = results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
      }));

      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles,
      });
    } catch (error) {
      throw createError('Failed to upload files', 500);
    }
  })
);

// Delete file
router.delete('/:publicId',
  asyncHandler(async (req, res) => {
    const { publicId } = req.params;

    try {
      await cloudinary.uploader.destroy(publicId);
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      throw createError('Failed to delete file', 500);
    }
  })
);

export default router;
