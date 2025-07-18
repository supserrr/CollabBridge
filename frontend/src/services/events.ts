import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { 
  Event, 
  EventForm, 
  EventApplication, 
  SearchFilters, 
  SearchResponse, 
  ApiResponse 
} from '../types';

class EventService {
  async getEvents(filters?: SearchFilters): Promise<SearchResponse<Event>> {
    try {
      const response = await api.get<ApiResponse<SearchResponse<Event>>>('/events', {
        params: filters
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEventById(id: string): Promise<Event> {
    try {
      const response = await api.get<ApiResponse<Event>>(`/events/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyEvents(): Promise<Event[]> {
    try {
      const response = await api.get<ApiResponse<Event[]>>('/events/my/events');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async createEvent(eventData: EventForm): Promise<Event> {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.entries(eventData).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append images
      if (eventData.images) {
        Array.from(eventData.images).forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await api.post<ApiResponse<Event>>('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateEvent(id: string, eventData: Partial<EventForm>): Promise<Event> {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.entries(eventData).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append images
      if (eventData.images) {
        Array.from(eventData.images).forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await api.put<ApiResponse<Event>>(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await api.delete(`/events/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async applyToEvent(eventId: string, applicationData: {
    message: string;
    proposedRate?: number;
    rateType?: string;
  }): Promise<EventApplication> {
    try {
      const response = await api.post<ApiResponse<EventApplication>>(`/events/${eventId}/apply`, applicationData);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getEventApplications(eventId: string): Promise<EventApplication[]> {
    try {
      const response = await api.get<ApiResponse<EventApplication[]>>(`/events/${eventId}/applications`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<EventApplication> {
    try {
      const response = await api.patch<ApiResponse<EventApplication>>(`/applications/${applicationId}/status`, { status });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyApplications(): Promise<EventApplication[]> {
    try {
      const response = await api.get<ApiResponse<EventApplication[]>>('/applications/my');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async withdrawApplication(applicationId: string): Promise<void> {
    try {
      await api.delete(`/applications/${applicationId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFeaturedEvents(): Promise<Event[]> {
    try {
      const response = await api.get<ApiResponse<Event[]>>('/events/featured');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new EventService();
