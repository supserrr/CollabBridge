import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

export const setupCloudinary = (): void => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    logger.info('✅ Cloudinary configured successfully');
  } catch (error) {
    logger.error('❌ Cloudinary configuration failed:', error);
    throw error;
  }
};

export const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'collabbridge',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

export { cloudinary };
