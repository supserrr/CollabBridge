import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { 
  User, 
  ProfileForm, 
  EventPlannerProfile, 
  CreativeProfile, 
  ApiResponse 
} from '../types';

class UserService {
  async updateProfile(profileData: ProfileForm): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>('/users/profile', profileData);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateProfileImage(image: File): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('profileImage', image);

      const response = await api.post<ApiResponse<User>>('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updatePortfolio(images: File[], links: string[]): Promise<CreativeProfile> {
    try {
      const formData = new FormData();
      
      // Append images
      images.forEach((image) => {
        formData.append('portfolioImages', image);
      });

      // Append links
      formData.append('portfolioLinks', JSON.stringify(links));

      const response = await api.post<ApiResponse<CreativeProfile>>('/users/portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEventPlannerProfile(userId: string): Promise<EventPlannerProfile> {
    try {
      const response = await api.get<ApiResponse<EventPlannerProfile>>(`/users/${userId}/planner-profile`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getCreativeProfile(userId: string): Promise<CreativeProfile> {
    try {
      const response = await api.get<ApiResponse<CreativeProfile>>(`/users/${userId}/creative-profile`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateAvailability(isAvailable: boolean, availableFrom?: string, availableTo?: string): Promise<CreativeProfile> {
    try {
      const response = await api.patch<ApiResponse<CreativeProfile>>('/users/availability', {
        isAvailable,
        availableFrom,
        availableTo
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateRates(hourlyRate?: number, dailyRate?: number): Promise<CreativeProfile> {
    try {
      const response = await api.patch<ApiResponse<CreativeProfile>>('/users/rates', {
        hourlyRate,
        dailyRate
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await api.delete('/users/account');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateLanguage(language: string): Promise<User> {
    try {
      const response = await api.patch<ApiResponse<User>>('/users/language', { language });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new UserService();
