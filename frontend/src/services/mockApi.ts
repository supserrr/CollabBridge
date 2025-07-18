// Mock API service for development when backend is not available
export const mockAuthService = {
  isAuthenticated: () => false,
  
  getCurrentUser: async () => {
    throw new Error('Not authenticated');
  },
  
  login: async (credentials: any) => {
    throw new Error('Backend not available - please start the backend server');
  },
  
  register: async (userData: any) => {
    throw new Error('Backend not available - please start the backend server');
  },
  
  logout: async () => {
    // Clear any stored tokens
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

export const mockSearchService = {
  searchProfessionals: async (filters: any) => {
    return { data: [] };
  }
};

export const mockEventsService = {
  getEvents: async () => {
    return [];
  }
};

export const mockBookingsService = {
  getBookings: async () => {
    return [];
  }
};
