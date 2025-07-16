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

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  options: Record<string, any> = {}
): Promise<CloudinaryResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        });
      }
    );

    uploadStream.end(buffer);
  });
};

export { cloudinary };
