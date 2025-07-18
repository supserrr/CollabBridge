import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { ApiResponse } from '../types';

interface UploadResponse {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

class UploadService {
  async uploadImage(file: File, folder?: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (folder) formData.append('folder', folder);

      const response = await api.post<ApiResponse<UploadResponse>>('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async uploadFile(file: File, folder?: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);

      const response = await api.post<ApiResponse<UploadResponse>>('/uploads/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async uploadMultipleImages(files: File[], folder?: string): Promise<UploadResponse[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      if (folder) formData.append('folder', folder);

      const response = await api.post<ApiResponse<UploadResponse[]>>('/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await api.delete(`/uploads/${publicId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getSignedUploadUrl(fileName: string, fileType: string): Promise<{
    signedUrl: string;
    publicId: string;
  }> {
    try {
      const response = await api.post<ApiResponse<{
        signedUrl: string;
        publicId: string;
      }>>('/uploads/signed-url', {
        fileName,
        fileType
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Helper method to validate file types
  validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    return true;
  }

  validateDocumentFile(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 50MB.');
    }

    return true;
  }

  // Helper method to compress images before upload
  async compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

export default new UploadService();
