/**
 * Cloudinary Upload Utilities
 * Provides robust image upload functionality with fallback options
 */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export interface CloudinaryUploadError {
  error: {
    message: string;
    http_code?: number;
  };
}

/**
 * Upload a single image to Cloudinary with error handling
 */
export async function uploadImageToCloudinary(
  file: File,
  options: {
    folder?: string;
    uploadPreset?: string;
    cloudName?: string;
  } = {}
): Promise<string> {
  const {
    folder = 'events',
    uploadPreset = 'ml_default',
    cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  } = options;

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  console.log('Uploading to Cloudinary:', {
    cloudName,
    fileName: file.name,
    fileSize: file.size,
    uploadPreset,
    folder
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.ok) {
      const data: CloudinaryUploadResult = await response.json();
      console.log('Cloudinary upload success:', {
        url: data.secure_url,
        publicId: data.public_id
      });
      return data.secure_url;
    } else {
      const errorData: CloudinaryUploadError = await response.json().catch(() => ({
        error: { message: `HTTP ${response.status}: ${response.statusText}` }
      }));

      console.error('Cloudinary upload failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        cloudName,
        fileName: file.name,
        uploadPreset
      });

      // Provide specific error messages for common issues
      let errorMessage = errorData.error?.message || response.statusText;
      
      if (response.status === 400 && errorMessage.includes('Upload preset')) {
        errorMessage = `Upload preset "${uploadPreset}" not found. Please configure the preset in Cloudinary or contact support.`;
      } else if (response.status === 401) {
        errorMessage = 'Unauthorized upload. Please check Cloudinary configuration.';
      } else if (response.status === 413) {
        errorMessage = 'File too large. Please use a smaller image.';
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred during upload');
  }
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadMultipleImages(
  files: File[],
  options: {
    folder?: string;
    uploadPreset?: string;
    cloudName?: string;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<string[]> {
  const { onProgress } = options;
  const uploadPromises = files.map(async (file, index) => {
    try {
      const url = await uploadImageToCloudinary(file, options);
      if (onProgress) {
        onProgress(index + 1, files.length);
      }
      return url;
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Check if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
}

/**
 * Get Cloudinary configuration status
 */
export function getCloudinaryStatus(): {
  configured: boolean;
  cloudName?: string;
  issues: string[];
} {
  const issues: string[] = [];
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    issues.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is not set');
  }

  return {
    configured: issues.length === 0,
    cloudName,
    issues
  };
}
