import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary';
import { createError } from './errorHandler';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'collabbridge',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  } as any,
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'
    ];
    
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (allowedTypes.includes(fileExtension || '')) {
      cb(null, true);
    } else {
      cb(createError('Invalid file type', 400));
    }
  },
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string; maxCount: number }[]) => 
  upload.fields(fields);

export { upload };
