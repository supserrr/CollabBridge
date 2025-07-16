import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

export const setupCloudinary = (): void => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    logger.info('☁️  Cloudinary configured successfully');
  } catch (error) {
    logger.error('❌ Cloudinary configuration failed:', error);
    throw error;
  }
};

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  options: any = {}
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) {
          logger.error('❌ Cloudinary upload failed:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`🗑️  Deleted file from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('❌ Cloudinary deletion failed:', error);
    throw error;
  }
};

export default cloudinary;
